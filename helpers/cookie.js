
function setCookieValue(res, cookie, value)
{
    res.setHeader("Set-Cookie", cookie + "=" + value);
    console.log(res);
}

module.exports = {
    setCookieValue: setCookieValue
};