Dropzone.autoDiscover = false;

function init() {
    let dropzoneElement = document.querySelector("#dropzone");

    // Initialize Dropzone
    let dz = new Dropzone("#dropzone", {
        url: "http://127.0.0.1:5000/classify_image",
        method: "post",  // Ensure method is POST
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Upload an Image",
        autoProcessQueue: false
    });
    

    // Event: When a file is added
    dz.on("addedfile", function() {
        if (dz.files.length > 1) {
            dz.removeFile(dz.files[0]);
        }
    });

    // Event: When a file upload is complete
    dz.on("complete", function (file) {
        let imageData = file.dataURL; // Image data from the file

        // POST the image data to the backend for classification
        let url = "http://127.0.0.1:5000/classify_image";
        $.post(url, { image_data: imageData }, function(data, status) {

            // Handling the response data from server
            if (!data || data.length === 0) {
                displayError();
                return;
            }

            let players = ["lionel_messi", "maria_sharapova", "roger_federer", "serena_williams", "virat_kohli"];
            let bestMatch = getBestMatch(data);

            if (bestMatch) {
                displayResult(bestMatch);
            }
        });
    });

    // Submit button action to trigger Dropzone upload
    document.querySelector("#submitBtn").addEventListener("click", function () {
        dz.processQueue();
    });
}

// Display an error message
function displayError() {
    document.querySelector("#error").style.display = "block";
    document.querySelector("#resultHolder").style.display = "none";
    document.querySelector("#divClassTable").style.display = "none";
}

// Find the best matching class based on highest probability
function getBestMatch(data) {
    let bestMatch = null;
    let highestScore = -1;

    data.forEach(item => {
        let maxScore = Math.max(...item.class_probability);
        if (maxScore > highestScore) {
            highestScore = maxScore;
            bestMatch = item;
        }
    });

    return bestMatch;
}

// Display classification results on the page
function displayResult(match) {
    document.querySelector("#error").style.display = "none";
    document.querySelector("#resultHolder").style.display = "block";
    document.querySelector("#divClassTable").style.display = "block";

    let resultHolder = document.querySelector(`#resultHolder`);
    resultHolder.innerHTML = document.querySelector(`[data-player="${match.class}"]`).innerHTML;

    let classDictionary = match.class_dictionary;

    // Update the score for each player
    for (let playerName in classDictionary) {
        let index = classDictionary[playerName];
        let score = match.class_probability[index];
        document.querySelector(`#score_${playerName}`).innerHTML = score;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#error").style.display = "none";
    document.querySelector("#resultHolder").style.display = "none";
    document.querySelector("#divClassTable").style.display = "none";
    
    init(); // Initialize the Dropzone
});
