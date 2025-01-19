$(document).ready(function() {
    $('#addNote').click(function() {
        addNote();
    });

    $('#noteInput').keypress(function(event) {
        if (event.which == 13) {  // Enter key has keyCode = 13
            event.preventDefault();  // Prevent the default action to avoid form submission
            addNote();
        }
    });

    function addNote() {
        var note = $('#noteInput').val();
        if (note) {
            $.ajax({
                type: "POST",
                url: "/add_note",
                data: JSON.stringify({note: note}),
                contentType: "application/json",
                dataType: "json",
                success: function(data) {
                    var newNote = $('<li>' + data.note + '</li>').hide();
                    $('#notesList').append(newNote);
                    newNote.fadeIn(1000);
                    $('#noteInput').val('');
                },
                error: function(xhr, status, error) {
                    console.error("Error in AJAX request:", status, error);
                }
            });
        }
    }

    $('#notesList').on('click', 'li', function() {
        $(this).fadeOut(500, function() {
            $(this).hide();
            checkHidden();
        });
    });

    $('#showNotes').click(function() {
        $('li:hidden').fadeIn(500);
        $(this).hide(); // Hide the 'Show Notes' button after showing all notes
    });

    function checkHidden() {
        if ($('li:hidden').length > 0) {
            $('#showNotes').show();
        } else {
            $('#showNotes').hide();
        }
    }
});


