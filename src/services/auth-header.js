export default function authHeader() {
    let user = JSON.parse(localStorage.getItem('user'));

    if (user && user.token) {
        return {
            Authorization: "Bearer " + user.token,
            Accept: "application/json",
            "Content-Type": "application/json",
        };
        //return { Authorization: 'Bearer ' + user.token };
    } else {
        return {};
    }
}
