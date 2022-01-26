exports.getdate = function() {
    const today = new Date();
    let option = {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }
    var day = today.toLocaleDateString("en-us", option);
    return day;
}