$(function () {
    const socket = io('/', {forceNew: true});

    socket.on('log', (data) => { // retrieve the log stream
        $("#logs").prepend(data + '\n');
    });

    window.get = () => { // make a GET request to server
        $.get('/api', {
            countrycode: $("#countryCode").val(),
            Category: $("#category").val(),
            BaseBid: $("#baseBid").val()
        }, (data) => {
            $("#result").prepend(JSON.stringify(data) + '\n');
        });
    }
});