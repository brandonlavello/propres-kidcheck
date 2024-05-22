// fetchWrapper.js

// Helper function to handle response errors
export async function handleResponse(response) {
  console.log(response);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || response.statusText);
  }
  return response.ok;
}

export async function get(url, headers = {}) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
  const responseBody = await response.json();
  // console.log("Response body:", responseBody);

  // console.log("In func",  response.body);
  return responseBody;
}

export async function post(url, data, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function put(url, data, headers = {}) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
