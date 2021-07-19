function render() {
    return `<h1>Your new website!</h1>`;
}
new WebSocket("ws://localhost:1234").addEventListener("message", ()=>window.location.reload()
);
document.body.innerHTML = render();
