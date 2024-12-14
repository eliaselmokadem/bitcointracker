const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InMxNDE3NjVAYXAuYmUiLCJpYXQiOjE3MzQxNTMyMzl9.RXhidMreLD1UX9zLYODdk2bw556opZuzgsiH0WHs9kI";
const BASE_URL = "https://sampleapis.assimilate.be";

export const API_ENDPOINTS = {
  BITCOIN_PRICES: `${BASE_URL}/bitcoin/historical_prices`,
};

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders = {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    console.log('Making request to:', url);
    console.log('With options:', {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      console.error('Server response:', responseText);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`HTTP error! status: ${response.status}, details: ${responseText}`);
    }

    // Only try to parse as JSON if we have content
    const data = responseText ? JSON.parse(responseText) : null;
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function postData<T>(url: string, data: any): Promise<ApiResponse<T>> {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      // Format the data exactly like our successful curl request
      const formattedData = {
        ...data,
        id: Date.now().toString(),
        // Ensure numeric fields are numbers, not strings
        Price: Number(data.Price),
        Open: Number(data.Open),
        High: Number(data.High),
        ChangePercentFromLastMonth: Number(data.ChangePercentFromLastMonth)
      };

      console.log(`Attempt ${retryCount + 1} - POST request to:`, url);
      console.log('Request body:', JSON.stringify(formattedData, null, 2));
      
      const response = await fetchWithAuth<T>(url, {
        method: 'POST',
        body: JSON.stringify(formattedData)
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} failed:`, error);
      retryCount++;
      
      if (retryCount === maxRetries) {
        console.error('All retry attempts failed');
        return { error: error instanceof Error ? error.message : 'Failed to post data after multiple attempts' };
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  return { error: 'Failed to post data after exhausting all retries' };
}

export async function getData<T>(url: string): Promise<ApiResponse<T>> {
  return fetchWithAuth<T>(url, {
    method: 'GET'
  });
}
