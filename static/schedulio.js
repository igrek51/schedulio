function ajaxRequest(type, url, onSuccess) {
    $.ajax({
        url: url,
        type: type,
        data: {},
        cache: false,
        success: function(data) {
            onSuccess(data)
        },
        error: function (xhr, status, error) {
            if (xhr.hasOwnProperty('responseJSON') && xhr.responseJSON.hasOwnProperty('error')) { 
                message = xhr.responseJSON.error
            } else {
                message = xhr.statusText
            }
            showAlert('Error: ' + message, 'danger')
        }
    })
}

function showAlert(message, type) {
    console.log('alert ' + type + ': ' + message)
    var wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible" role="alert">' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>'
    document.getElementById('alerts-placeholder').append(wrapper)
    $('.alert-dismissible').click(function () {
        $(this).remove()
    })
}
