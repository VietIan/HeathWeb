const ZALO_API_URL = "https://openapi.zaloplatform.com/v2.0/oa/message";

export const sendZaloText = async (userId, text) => {
    if (!process.env.ZALO_BOT_TOKEN) {
        console.warn("ZALO_BOT_TOKEN is not set");
        return;
    }

    const payload = {
        recipient: { user_id: userId },
        message: { text }
    };

    try {
        const response = await fetch(ZALO_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "access_token": process.env.ZALO_BOT_TOKEN
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Zalo API Error:", error);
        throw error;
    }
};
