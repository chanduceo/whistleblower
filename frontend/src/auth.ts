export function setCsrf(token: string) { localStorage.setItem("csrf", token); }
export function getCsrf() { return localStorage.getItem("csrf") || ""; }