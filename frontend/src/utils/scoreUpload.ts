interface UploadScoreData {
  meta: {
    game: string;
    service: string;
    playtype: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scores: any[];
}

interface UploadScoreResponse {
  scoreCount: number;
  message?: string;
}

export async function uploadScore(data: UploadScoreData): Promise<UploadScoreResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/uploadScore`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      meta: {
        game: data.meta.game,
        service: data.meta.service,
        playtype: data.meta.playtype
      },
      scores: data.scores
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload scores');
  }

  return response.json();
}
