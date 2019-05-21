
import { JWT_EXPIRED } from '../errors';
import { OAUTH_HOST, OAUTH_PORT, REFRESH_TOKEN_ENDPOINT } from '../constants';

const refreshToken = async () => {
    const refreshToken = sessionStorage.getItem('refresh-token');
    try{
        let response = await fetch(`http://${OAUTH_HOST}:${OAUTH_PORT}/${REFRESH_TOKEN_ENDPOINT}`, 
            {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
            }
        });
        response = await response.json();
        sessionStorage.setItem('access-token', response.access_token);
        return response.access_token;
    } catch(error) {
        console.log(error);
    }
};

const doTwiceIfExpired = async (func) => {
    let token = sessionStorage.getItem('access-token');
    let json = await func(token);
    if (!json.ok && json.message === JWT_EXPIRED) {
        token = await refreshToken();
        json = await func(token);
    }
    return json;
};

export {
    refreshToken,
    doTwiceIfExpired
};
