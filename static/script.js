$(document).ready(function() {
    let selectedNote = null;
    let deletedWords = [];

    $('#noteInput').keypress(function(event) {
        if (event.which == 13) {  // Enter key has keyCode = 13
            event.preventDefault();
            addNote();
        }
    });

    $('#addNote').click(function() {
        addNote();
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
        if (selectedNote) {
            selectedNote.removeClass('selected');
        }
        selectedNote = $(this).addClass('selected');
        $('.sidebar').show();
    });

    $('.sidebar button').click(function() {
        if (!selectedNote) return;

        let action = $(this).attr('id').replace('Note', '').toLowerCase();

        if (action === 'erase') {
            let words = selectedNote.text().split(' ');
            deletedWords.push(words.pop());
            selectedNote.text(words.join(' ') + ' ');
            $('#showHiddenWords').show();
        } else {
            selectedNote.toggleClass(action);
        }
    });

    $('#showHiddenWords').click(function() {
        if (!selectedNote || deletedWords.length === 0) return;

        let hiddenWord = deletedWords.pop();
        let currentText = selectedNote.text();
        selectedNote.text(currentText + hiddenWord);
        
        if (deletedWords.length === 0) {
            $(this).hide();
        }
    });

    $(document).click(function(event) {
        if (!$(event.target).closest('.content-area').length) {
            if (selectedNote) {
                selectedNote.removeClass('selected');
                selectedNote = null;
                $('.sidebar').hide();
            }
        }
    });
});
