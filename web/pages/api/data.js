export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  const { endpoint } = req.query;
  const url = `http://127.0.0.1:8000/${endpoint}`;

  // Forward both GET and POST requests
  const response = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
    },
    body: req.method === "POST" ? JSON.stringify(req.body) : null,
  });
  const data = await response.json();
  res.status(200).json(data);
}
