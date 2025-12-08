import express from "express";
import { prisma } from "../config/db";
import { PAGE_SIZE } from "../config/constants";
import crypto from "crypto";

// Helper function to create a CASE statement for Japanese-style grade sorting
const createGradeCaseStatement = (sortKeyString: string, directionString: string): string => {
  const gradeOrder = [
    'F', 'F+',
    'E-', 'E', 'E+',
    'D-', 'D', 'D+',
    'C-', 'C', 'C+',
    'B-', 'B', 'B+',
    'A-', 'A', 'A+',
    'AA-', 'AA', 'AA+',
    'AAA-', 'AAA', 'AAA+',
    'S-', 'S', 'S+',
    'SS-', 'SS', 'SS+',
    'SSS-', 'SSS', 'SSS+'
  ];

  let caseStatement = `CASE `;
  gradeOrder.forEach((grade, index) => {
    caseStatement += `WHEN UPPER(TRIM(s.data->>'${sortKeyString}')) = '${grade}' THEN ${index} `;
  });
  caseStatement += `ELSE 999 END`;

  if (directionString === 'desc') {
    caseStatement += ' DESC';
  } else {
    caseStatement += ' ASC';
  }

  return caseStatement;
};

export const handleScoreUpload = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { meta, scores } = req.body;
    const userId = req.session.userId;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Please log in to upload scores." });
    }

    // Basic universal validation
    if (!meta || !meta.game || !meta.service || !scores) {
      return res.status(400).json({
        error:
          "Invalid request format. Expected meta with game/service and scores array",
      });
    }
    let game = await prisma.game.findUnique({
      where: { internalName: meta.game },
    });
    if (!game) {
      game = await prisma.game.findFirst({
        where: { formattedName: meta.game },
      });
    }
    if (!game) {
      return res.status(400).json({
        error: `Game '${meta.game}' is not supported. Ensure that you are using the case-sensitive version of either the internal name or formatted name`,
      });
    }
    const internalGameName = game.internalName;
    const scoresArray = Array.isArray(scores) ? scores : [scores];

    const scoresToCreate = [];
    let skippedCount = 0;

    for (const scoreData of scoresArray) {
      const chartIdHash = crypto
        .createHash("sha1")
        .update(`${internalGameName}${scoreData.title}${scoreData.artist}`)
        .digest("hex");
      // Check if exact same score data already exists
      const existingScore = await prisma.score.findFirst({
        where: {
          gameInternalName: internalGameName,
          userId: userId,
          data: {
            equals: scoreData,
          },
        },
      });

      if (existingScore) {
        skippedCount++;
      } else {
        const chartExists = await prisma.charts.findFirst({
          where: {
            gameInternalName: internalGameName,
            chartId: chartIdHash,
          },
        });
        if (!chartExists) {
          await prisma.charts.create({
            data: {
              gameInternalName: internalGameName,
              chartId: chartIdHash,
              title: scoreData.title,
              artist: scoreData.artist,
            },
          });
        }
        scoresToCreate.push({
          gameInternalName: internalGameName,
          userId: userId,
          chartId: chartIdHash,
          timestamp: scoreData.timestamp,
          data: scoreData,
        });
      }
    }

    const createdScores =
      scoresToCreate.length > 0
        ? await prisma.score.createMany({
            data: scoresToCreate,
          })
        : { count: 0 };

    res.status(200).json({
      message: "Score upload processed successfully",
      game: meta.game,
      service: meta.service,
      scoreCount: createdScores.count,
      skippedCount: skippedCount,
      totalProcessed: scoresArray.length,
    });
  } catch (error) {
    console.error("Score upload endpoint error:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Unable to process score upload" });
  }
};

export const handleExportScoreForGame = async (
  req: express.Request,
  res: express.Response,
) => {
  const { internalGameName, page } = req.query;
  const userId = req.session.userId;
  if (!userId || !internalGameName) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  const offset = (Math.max(parseInt(page as string) || 1, 1) - 1) * 50;
  const scores: any = await prisma.$queryRaw`
    SELECT * FROM "Score"
    WHERE "userId" = ${userId}
    AND "gameInternalName" = ${internalGameName}
    ORDER BY (data->>'timestamp')::numeric desc
    OFFSET ${offset} LIMIT 50
  `;
  const safeScores = scores.map((score: any) => ({
    ...score,
    timestamp: typeof score.timestamp === "bigint" ? Number(score.timestamp) : score.timestamp,
  }));

  res.status(200).json({
    scores: safeScores,
  });
};

export const handleScoreDeletion = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, internalGameName, scoreId } = req.query;
    if (!userId || !internalGameName || !scoreId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const userIdNumber = parseInt(userId as string);
    const scoreIdNumber = parseInt(scoreId as string);

    await prisma.score.deleteMany({
      where: {
        userId: userIdNumber,
        gameInternalName: internalGameName as string,
        id: scoreIdNumber,
      },
    });

    res.status(200).json({ message: "Scores deleted successfully" });
  } catch (error) {
    console.error("Score deletion endpoint error:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Unable to delete scores" });
  }
};

export const handleGetScores = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userId, internalGameName, pageNum, sortKey, direction, pbOnly } =
      req.query;
    if (!userId || !internalGameName || !pageNum) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const pageNumber = parseInt(pageNum as string);
    const gameInternalName = internalGameName as string;
    const userIdNumber = parseInt(userId as string);
    const sortKeyString = (sortKey as string) || "timestamp";
    const directionString =
      (direction as string)?.toLowerCase() === "asc" ? "asc" : "desc";
    const pbOnlyFlag = pbOnly === "true";

    if (
      directionString &&
      directionString !== "asc" &&
      directionString !== "desc"
    ) {
      return res.status(400).json({ error: "Invalid direction parameter" });
    }

    let scores;
    let totalScores;

    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
      select: { username: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (pbOnlyFlag) {
      // For pbOnly, we need to get the best score for each chart
      if (sortKeyString === "timestamp") {
        scores = await prisma.$queryRawUnsafe<any[]>(
          `
          SELECT DISTINCT ON ("chartId") *
          FROM "Score"
          WHERE "gameInternalName" = $1 AND "userId" = $2
          ORDER BY "chartId", "timestamp" ${directionString.toUpperCase()}
          OFFSET $3
          LIMIT $4
          `,
          gameInternalName,
          userIdNumber,
          (pageNumber - 1) * PAGE_SIZE,
          PAGE_SIZE,
        );
      } else {
        // Check if we need grade-based sorting by sampling one score
        const sampleScore = await prisma.$queryRawUnsafe<any[]>(
          `SELECT data->>'${sortKeyString}' as value FROM "Score" WHERE "gameInternalName" = $1 AND "userId" = $2 AND data->>'${sortKeyString}' IS NOT NULL LIMIT 1`,
          gameInternalName,
          userIdNumber
        );

        // If it is not a numerical value
        const isGradeSort = sampleScore.length > 0 &&
          sampleScore[0].value &&
          /^[A-Z]+[+-]?$/i.test(sampleScore[0].value.trim());

        if (isGradeSort) {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT DISTINCT ON ("chartId") *
            FROM "Score"
            WHERE "gameInternalName" = $1 AND "userId" = $2
            ORDER BY "chartId", ${createGradeCaseStatement(sortKeyString, directionString)}
            OFFSET $3
            LIMIT $4
            `,
            gameInternalName,
            userIdNumber,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        } else {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT DISTINCT ON ("chartId") *
            FROM "Score"
            WHERE "gameInternalName" = $1 AND "userId" = $2
            ORDER BY "chartId", (data->>'${sortKeyString}')::numeric ${directionString.toUpperCase()}
            OFFSET $3
            LIMIT $4
            `,
            gameInternalName,
            userIdNumber,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        }
      }

      // Count distinct charts for pagination
      const chartCountResult = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT COUNT(DISTINCT "chartId") as count
        FROM "Score"
        WHERE "gameInternalName" = $1 AND "userId" = $2
        `,
        gameInternalName,
        userIdNumber,
      );
      totalScores = Number(chartCountResult[0]?.count || 0);
    } else {
      totalScores = await prisma.score.count({
        where: {
          gameInternalName,
          userId: userIdNumber,
        },
      });

      if (sortKeyString === "timestamp") {
        scores = await prisma.score.findMany({
          where: {
            gameInternalName,
            userId: userIdNumber,
          },
          orderBy: {
            timestamp: directionString,
          },
          skip: (pageNumber - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        });
      } else {
        // Check if we need grade-based sorting by sampling one score
        const sampleScore = await prisma.$queryRawUnsafe<any[]>(
          `SELECT data->>'${sortKeyString}' as value FROM "Score" WHERE "gameInternalName" = $1 AND "userId" = $2 AND data->>'${sortKeyString}' IS NOT NULL LIMIT 1`,
          gameInternalName,
          userIdNumber
        );

        const isGradeSort = sampleScore.length > 0 &&
          sampleScore[0].value &&
          /^[A-Z]+[+-]?$/i.test(sampleScore[0].value.trim());

        if (isGradeSort) {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT * FROM "Score"
            WHERE "gameInternalName" = $1 AND "userId" = $2
            ORDER BY ${createGradeCaseStatement(sortKeyString, directionString)}
            OFFSET $3
            LIMIT $4
          `,
            gameInternalName,
            userIdNumber,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        } else {
          // everything else attempt to rawsql it
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT * FROM "Score"
            WHERE "gameInternalName" = $1 AND "userId" = $2
            ORDER BY (data->>'${sortKeyString}')::numeric ${directionString.toUpperCase()}
            OFFSET $3
            LIMIT $4
          `,
            gameInternalName,
            userIdNumber,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        }
      }
    }

    const num_pages = Math.ceil(totalScores / PAGE_SIZE);
    if (!scores) {
      return res.status(404).json({
        error:
          "No scores found. Either no scores exist or the sortKey provided is invalid for the game, sortKey: " +
          sortKeyString,
      });
    }

    const safeScores = scores.map((score) => ({
      ...score,
      timestamp:
        typeof score.timestamp === "bigint"
          ? Number(score.timestamp)
          : score.timestamp,
    }));

    res.status(200).json({
      scores: safeScores,
      num_pages,
      user: user.username
    });
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Unable to fetch scores" });
  }
};


export const handleGetScoresByChartId = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { chartId } = req.params;
    const { sortKey, direction, pageNum, pbOnly, game } = req.query;
    const chartIdString = chartId as string;
    const pageNumber = parseInt(pageNum as string);
    const sortKeyString = (sortKey as string) || "timestamp";
    const directionString =
      (direction as string)?.toLowerCase() === "asc" ? "asc" : "desc";
    const pbOnlyFlag = pbOnly === "true";
    const gameInternalName = game as string;

    if (
      directionString &&
      directionString !== "asc" &&
      directionString !== "desc"
    ) {
      return res.status(400).json({ error: "Invalid direction parameter" });
    }

    let scores;
    let totalScores;

    if (pbOnlyFlag) {
      if (sortKeyString === "timestamp") {
        scores = await prisma.$queryRawUnsafe<any[]>(
          `
          SELECT DISTINCT ON (s."userId") s.*, u.username
          FROM "Score" s
          JOIN "User" u ON s."userId" = u.id
          WHERE s."chartId" = $1 AND s."gameInternalName" = $2
          ORDER BY s."userId", s."timestamp" ${directionString.toUpperCase()}
          OFFSET $3
          LIMIT $4
          `,
          chartIdString,
          gameInternalName,
          (pageNumber - 1) * PAGE_SIZE,
          PAGE_SIZE,
        );
      } else {
        // Check if we need grade-based sorting by sampling one score
        const sampleScore = await prisma.$queryRawUnsafe<any[]>(
          `SELECT s.data->>'${sortKeyString}' as value FROM "Score" s WHERE s."chartId" = $1 AND s."gameInternalName" = $2 AND s.data->>'${sortKeyString}' IS NOT NULL LIMIT 1`,
          chartIdString,
          gameInternalName
        );

        const isGradeSort = sampleScore.length > 0 &&
          sampleScore[0].value &&
          /^[A-Z]+[+-]?$/i.test(sampleScore[0].value.trim());

        if (isGradeSort) {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT DISTINCT ON (s."userId") s.*, u.username
            FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."chartId" = $1 AND s."gameInternalName" = $2
            ORDER BY s."userId", ${createGradeCaseStatement(sortKeyString, directionString)}
            OFFSET $3
            LIMIT $4
            `,
            chartIdString,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        } else {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT DISTINCT ON (s."userId") s.*, u.username
            FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."chartId" = $1 AND s."gameInternalName" = $2
            ORDER BY s."userId", (s.data->>'${sortKeyString}')::numeric ${directionString.toUpperCase()}
            OFFSET $3
            LIMIT $4
            `,
            chartIdString,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        }
      }

      // Count distinct users for pagination
      const userCountResult = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT COUNT(DISTINCT "userId") as count
        FROM "Score"
        WHERE "chartId" = $1 AND "gameInternalName" = $2
        `,
        chartIdString,
        gameInternalName,
      );
      totalScores = Number(userCountResult[0]?.count || 0);
    } else {
      totalScores = await prisma.score.count({
        where: {
          chartId: chartIdString,
          gameInternalName: gameInternalName,
        },
      });

      if (sortKeyString === "timestamp") {
        scores = await prisma.score.findMany({
          where: {
            chartId: chartIdString,
            gameInternalName: gameInternalName,
          },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            timestamp: directionString,
          },
          skip: (pageNumber - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        });
      } else {
        // Check if we need grade-based sorting by sampling one score
        const sampleScore = await prisma.$queryRawUnsafe<any[]>(
          `SELECT s.data->>'${sortKeyString}' as value FROM "Score" s WHERE s."chartId" = $1 AND s."gameInternalName" = $2 AND s.data->>'${sortKeyString}' IS NOT NULL LIMIT 1`,
          chartIdString,
          gameInternalName
        );

        const isGradeSort = sampleScore.length > 0 &&
          sampleScore[0].value &&
          /^[A-Z]+[+-]?$/i.test(sampleScore[0].value.trim());

        if (isGradeSort) {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT s.*, u.username FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."chartId" = $1 AND s."gameInternalName" = $2
            ORDER BY ${createGradeCaseStatement(sortKeyString, directionString)}
            OFFSET $3
            LIMIT $4
          `,
            chartIdString,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        } else {
          // everything else attempt to rawsql it
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT s.*, u.username FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."chartId" = $1 AND s."gameInternalName" = $2
            ORDER BY (s.data->>'${sortKeyString}')::numeric ${directionString.toUpperCase()}
            OFFSET $3
            LIMIT $4
          `,
            chartIdString,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        }
      }
    }

    const num_pages = Math.ceil(totalScores / PAGE_SIZE);
    if (!scores) {
      return res.status(404).json({
        error:
          "No scores found. Either no scores exist or the sortKey provided is invalid for the game, sortKey: " +
          sortKeyString,
      });
    }

    const safeScores = scores.map((score) => ({
      ...score,
      username: score.user?.username || score.username,
      timestamp:
        typeof score.timestamp === "bigint"
          ? Number(score.timestamp)
          : score.timestamp,
    }));

    res.status(200).json({
      scores: safeScores,
      num_pages,
    });
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Unable to fetch scores" });
  }
};

export const handleGetAllGameScores = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { internalGameName, pageNum, sortKey, direction, pbOnly } = req.query;
    if (!internalGameName || !pageNum) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const pageNumber = parseInt(pageNum as string);
    const gameInternalName = internalGameName as string;
    const sortKeyString = (sortKey as string) || "timestamp";
    const directionString =
      (direction as string)?.toLowerCase() === "asc" ? "asc" : "desc";
    const pbOnlyFlag = pbOnly === "true";

    if (
      directionString &&
      directionString !== "asc" &&
      directionString !== "desc"
    ) {
      return res.status(400).json({ error: "Invalid direction parameter" });
    }

    let scores;
    let totalScores;

    if (pbOnlyFlag) {
      // For pbOnly, we need to get the best score for each chart for each user
      if (sortKeyString === "timestamp") {
        scores = await prisma.$queryRawUnsafe<any[]>(
          `
          SELECT DISTINCT ON (s."chartId", s."userId") s.*, u.username
          FROM "Score" s
          JOIN "User" u ON s."userId" = u.id
          WHERE s."gameInternalName" = $1
          ORDER BY s."chartId", s."userId", s."timestamp" ${directionString.toUpperCase()}
          OFFSET $2
          LIMIT $3
          `,
          gameInternalName,
          (pageNumber - 1) * PAGE_SIZE,
          PAGE_SIZE,
        );
      } else {
        // Check if we need grade-based sorting by sampling one score
        const sampleScore = await prisma.$queryRawUnsafe<any[]>(
          `SELECT s.data->>'${sortKeyString}' as value FROM "Score" s WHERE s."gameInternalName" = $1 AND s.data->>'${sortKeyString}' IS NOT NULL LIMIT 1`,
          gameInternalName
        );

        const isGradeSort = sampleScore.length > 0 &&
          sampleScore[0].value &&
          /^[A-Z]+[+-]?$/i.test(sampleScore[0].value.trim());

        if (isGradeSort) {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT DISTINCT ON (s."chartId", s."userId") s.*, u.username
            FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."gameInternalName" = $1
            ORDER BY s."chartId", s."userId", ${createGradeCaseStatement(sortKeyString, directionString)}
            OFFSET $2
            LIMIT $3
            `,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        } else {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT DISTINCT ON (s."chartId", s."userId") s.*, u.username
            FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."gameInternalName" = $1
            ORDER BY s."chartId", s."userId", (s.data->>'${sortKeyString}')::numeric ${directionString.toUpperCase()}
            OFFSET $2
            LIMIT $3
            `,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        }
      }

      // Count distinct chart-user combinations for pagination
      const combinationCountResult = await prisma.$queryRawUnsafe<any[]>(
        `
        SELECT COUNT(DISTINCT (s."chartId", s."userId")) as count
        FROM "Score" s
        WHERE s."gameInternalName" = $1
        `,
        gameInternalName,
      );
      totalScores = Number(combinationCountResult[0]?.count || 0);
    } else {
      totalScores = await prisma.score.count({
        where: {
          gameInternalName,
        },
      });

      if (sortKeyString === "timestamp") {
        scores = await prisma.score.findMany({
          where: {
            gameInternalName,
          },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
          orderBy: {
            timestamp: directionString,
          },
          skip: (pageNumber - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        });
      } else {
        // Check if we need grade-based sorting by sampling one score
        const sampleScore = await prisma.$queryRawUnsafe<any[]>(
          `SELECT s.data->>'${sortKeyString}' as value FROM "Score" s WHERE s."gameInternalName" = $1 AND s.data->>'${sortKeyString}' IS NOT NULL LIMIT 1`,
          gameInternalName
        );

        const isGradeSort = sampleScore.length > 0 &&
          sampleScore[0].value &&
          /^[A-Z]+[+-]?$/i.test(sampleScore[0].value.trim());

        if (isGradeSort) {
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT s.*, u.username FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."gameInternalName" = $1
            ORDER BY ${createGradeCaseStatement(sortKeyString, directionString)}
            OFFSET $2
            LIMIT $3
          `,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        } else {
          // everything else attempt to rawsql it
          scores = await prisma.$queryRawUnsafe<any[]>(
            `
            SELECT s.*, u.username FROM "Score" s
            JOIN "User" u ON s."userId" = u.id
            WHERE s."gameInternalName" = $1
            ORDER BY (s.data->>'${sortKeyString}')::numeric ${directionString.toUpperCase()}
            OFFSET $2
            LIMIT $3
          `,
            gameInternalName,
            (pageNumber - 1) * PAGE_SIZE,
            PAGE_SIZE,
          );
        }
      }
    }

    const num_pages = Math.ceil(totalScores / PAGE_SIZE);
    if (!scores) {
      return res.status(404).json({
        error:
          "No scores found. Either no scores exist or the sortKey provided is invalid for the game, sortKey: " +
          sortKeyString,
      });
    }

    const safeScores = scores.map((score) => ({
      ...score,
      username: score.user?.username || score.username,
      timestamp:
        typeof score.timestamp === "bigint"
          ? Number(score.timestamp)
          : score.timestamp,
    }));

    res.status(200).json({
      scores: safeScores,
      num_pages,
    });
  } catch (error) {
    console.error("Failed to fetch all game scores:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Unable to fetch scores" });
  }
};
