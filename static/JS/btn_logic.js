const input_text = document.getElementById('outputText');
const speak_btn = document.getElementById('speak_btn');
const clear_btn = document.getElementById('btn_clear');
const download_btn = document.getElementById('btn_download');
download_btn.style.cursor = "not-allowed";
const btn = document.getElementById('btn_open_close');
const video_camera_container = document.getElementById('video_camera_container');
const progressBar = document.getElementById("progressBar");
const img_or_frames = document.getElementById('img_or_frames');
const no_video_icon = document.getElementById('no_video_icon');




function startLiveUpdate() {
    var progressBar = document.getElementById("progressBar");
    var value = 0;
    var increment = 1;
    var intervalTime = 30; // Update every 30 milliseconds
    var totalTime = 3000; // Total time in milliseconds

    var numSteps = totalTime / intervalTime; // Number of steps needed
    var incrementSize = 100 / numSteps; // Increment value for each step

    var video = document.getElementById('img_or_frames');

    setInterval(function () {
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var image = canvas.toDataURL('image/jpeg');
        if (value >= 100) {
            fetch('https://192.168.209.185/getPrediction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: image })
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if(data.label != null)
                {
                    document.getElementById('viewPridiction').innerHTML = data.label;
                    new_char = data.label;
                    if (new_char != "") {
                        text = String(document.getElementById('outputText').value)
                        last_char = String(text.charAt(text.length - 1))
                        if (last_char != new_char) {
                            text = text + new_char
                            document.getElementById('outputText').value = text;
                        }
                    }
                }
            }).catch(function (error) {
                console.log(error);
            });
            value = 0; // Reset value to 0 after reaching 100%
        } else {
            value += incrementSize;
        }
        progressBar.value = value;
    }, increment * intervalTime);

}


window.onload = function () {

    if (window.location == "https://192.168.209.185/SLR_LAB") {
        video_camera_container.removeChild(progressBar);
    }
}



btn.onclick = function () {
    if (btn.textContent == "OPEN CAMERA") {
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
                video_camera_container.removeChild(document.getElementById('img_or_frames'));
                const video = document.createElement('video');
                video.autoplay = true;
                video.srcObject = stream;
                video.id = "img_or_frames";
                video_camera_container.appendChild(video);
                btn.textContent = "CLOSE CAMERA" 
                video_camera_container.appendChild(progressBar);
                startLiveUpdate();     
            }).catch(function (error) {
                window.alert(error)
            });
    }
    else {
        window.location.reload();
        btn.textContent = "OPEN CAMERA";
    }
}


speak_btn.onclick = function(){
    if(input_text.value != "")
    {
        var message = new SpeechSynthesisUtterance();
        message.text = input_text.value;
        window.speechSynthesis.speak(message);
        download_btn.disabled = false;
        download_btn.style.cursor = "pointer";
        download_btn.classList.add('donwload_btn_hover');
    }
}

clear_btn.onclick = function()
{
    input_text.value = "";
}

download_btn.onclick = function()
{
    if(input_text.value == "")
    {
        download_btn.disabled = true;
        download_btn.style.cursor = "not-allowed";
        download_btn.classList.remove('donwload_btn_hover');
    }
    else
    {
        fetch("https://192.168.209.185/download", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({"text": input_text.value})
        }).then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'audio.mp3';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }
}