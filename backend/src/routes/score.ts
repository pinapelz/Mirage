import express from "express";
import { prisma } from "../config/db";
import { PAGE_SIZE } from "../config/constants";
import crypto from "crypto";

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
        if(!chartExists){
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
    const { userId, internalGameName, pageNum, sortKey, direction } = req.query;
    if (!userId || !internalGameName || !pageNum) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const pageNumber = parseInt(pageNum as string);
    const gameInternalName = internalGameName as string;
    const userIdNumber = parseInt(userId as string);
    const sortKeyString = (sortKey as string) || "timestamp";
    const directionString =
      (direction as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const num_pages = Math.ceil(
      (await prisma.score.count({
        where: {
          gameInternalName,
          userId: userIdNumber,
        },
      })) / PAGE_SIZE,
    );

    let scores;

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
    });
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Unable to fetch scores" });
  }
};
