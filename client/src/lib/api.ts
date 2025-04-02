// Properly declare Vite's environment variable types once
interface ImportMetaEnv {
  VITE_API_URL?: string;
  DEV?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Helper function to determine the appropriate API URL based on environment
export const getApiBaseUrl = (): string => {
  // Try to get Webflow extension API URL first
  try {
    const isExtension = !!window.webflow;
    if (isExtension) {
      return 'https://seo-copilot-api.paul-130.workers.dev';
    }
  } catch (e) {
    // Not in Webflow extension context
  }

  // Try to use local dev URL
  try {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const localWorkerUrl = 'http://localhost:8787';
      return localWorkerUrl;
    }
  } catch (e) {
    // Error accessing window.location, fall back to production
  }

  return 'https://seo-copilot-api.paul-130.workers.dev';
};

export async function analyzeSEO({ keyphrase, url, isHomePage }: { keyphrase: string; url: string; isHomePage: boolean }) {
  const apiBaseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${apiBaseUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyphrase, url }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error; // Re-throw to allow handling by the caller
  }
}

export async function fetchOAuthToken(authCode: string): Promise<string> {
  const response = await fetch('/api/oauth/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: authCode }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OAuth token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Register domains with the server to be added to the allowlist
 * @param domains Array of domain URLs to register
 * @returns Response from server
 */
export async function registerDomains(domains: string[]): Promise<{ success: boolean; message: string }> {
  const baseUrl = getApiBaseUrl();
  
  try {
    const response = await fetch(`${baseUrl}/api/register-domains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ domains })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: data.message || "Failed to register domains" 
      };
    }

    return { 
      success: true, 
      message: data.message || "Domains registered successfully" 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Error registering domains: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
