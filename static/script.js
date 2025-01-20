$(document).ready(function () {
    let selectedNote = null;

    $('#addNote').click(function () {
        addNote();
    });

    function addNote() {
        const note = $('#noteInput').val();
        if (note) {
            $.ajax({
                type: "POST",
                url: "/add_note",
                data: JSON.stringify({ note: note }),
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    const newNote = $('<li data-id="' + data.id + '">' + data.note + '</li>').hide();
                    $('#notesList').append(newNote);
                    newNote.fadeIn(1000);
                    $('#noteInput').val('');
                },
                error: function (xhr, status, error) {
                    console.error("Error in AJAX request:", status, error);
                }
            });
        }
    }

    $('#notesList').on('click', 'li', function () {
        selectedNote = $(this);
        const noteId = selectedNote.data('id');
        $('.sidebar').show().data('note-id', noteId);
    });

    $('.sidebar button#eraseNote').click(function () {
        if (!selectedNote) return;
    
        const noteId = $('.sidebar').data('note-id');
        const words = selectedNote.text().split(' ');
        const wordToHide = words.pop(); // Remove the last word
    
        if (wordToHide) {
            // AJAX call to remove the word and store it in the hidden words array
            $.ajax({
                type: "POST",
                url: "/hide_word",
                data: JSON.stringify({ note_id: noteId, word: wordToHide }),
                contentType: "application/json",
                dataType: "json",
                success: function (data) {
                    // Update the note's content in the UI
                    selectedNote.text(data.updated_content);
    
                    // Show the "Show Hidden Words" button if there are hidden words
                    if (data.hidden_words && data.hidden_words.length > 0) {
                        $('#showHiddenWords').show();
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error hiding word:", status, error);
                }
            });
    
            // Remove the word instance from the DOM
            selectedNote.text(words.join(' ')); // Update note text
        }
    });
    
    

    $('#showHiddenWords').click(function () {
        const noteId = $('.sidebar').data('note-id');
        if (!noteId) {
            alert("No note selected.");
            return;
        }
    
        $.ajax({
            type: "GET",
            url: "/get_hidden_words",
            data: { note_id: noteId },
            dataType: "json",
            success: function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
    
                const hiddenWords = data.hidden_words;
                if (hiddenWords.length === 0) {
                    alert("No hidden words for this note.");
                    return;
                }
    
                // Restore words one by one
                hiddenWords.forEach((word) => {
                    $.ajax({
                        type: "POST",
                        url: "/restore_word",
                        data: JSON.stringify({ note_id: noteId, word: word }),
                        contentType: "application/json",
                        dataType: "json",
                        success: function (restoreData) {
                            if (restoreData.error) {
                                console.error("Error restoring word:", restoreData.error);
                            } else {
                                // Update the note content in the UI
                                selectedNote.text(restoreData.updated_content);
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error("Error restoring word:", status, error);
                        }
                    });
                });
    
                // Hide the button after restoring all words
                $(this).hide();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching hidden words:", status, error);
            }
        });
    });
    
    
});

