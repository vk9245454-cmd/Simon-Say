  $(document).ready(function () {
    const buttonColors = ["green", "red", "yellow", "blue"];
    const tones = {
        green: 329.63,
        red: 261.63,
        yellow: 392,
        blue: 220,
        wrong: 110
    };

    let gamePattern = [];
    let userClickedPattern = [];
    let level = 0;
    let started = false;
    let acceptingInput = false;
    let audioContext;

    const bestSaved = localStorage.getItem("simonBestScore") || 0;
    $("#bestScore").text(bestSaved);

    function getAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        return audioContext;
    }

    function playSound(color) {
        const context = getAudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = color === "wrong" ? "sawtooth" : "sine";
        oscillator.frequency.value = tones[color];
        gain.gain.setValueAtTime(0.001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.28, context.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.28);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.3);
    }

    function flashButton(color, className = "active") {
        const button = $("#" + color);

        button.addClass(className);

        setTimeout(function () {
            button.removeClass(className);
        }, 260);
    }

    function updateBestScore() {
        const currentBest = Number(localStorage.getItem("simonBestScore") || 0);

        if (level > currentBest) {
            localStorage.setItem("simonBestScore", level);
            $("#bestScore").text(level);
        }
    }

    function nextSequence() {
        acceptingInput = false;
        userClickedPattern = [];
        level++;

        $("#level").text(level);
        $("#message").text("Watch the pattern...");
        $(".center-badge").text("Watch");

        const randomNumber = Math.floor(Math.random() * 4);
        const randomChosenColor = buttonColors[randomNumber];
        gamePattern.push(randomChosenColor);

        playPattern();
    }

    function playPattern() {
        let index = 0;

        const playback = setInterval(function () {
            const color = gamePattern[index];

            flashButton(color);
            playSound(color);
            index++;

            if (index >= gamePattern.length) {
                clearInterval(playback);

                setTimeout(function () {
                    acceptingInput = true;
                    $("#message").text("Your turn. Repeat the pattern.");
                    $(".center-badge").text("Play");
                }, 350);
            }
        }, 650);
    }

    function checkAnswer(currentIndex) {
        if (userClickedPattern[currentIndex] === gamePattern[currentIndex]) {
            if (userClickedPattern.length === gamePattern.length) {
                acceptingInput = false;
                updateBestScore();
                $("#message").text("Nice! Next level coming...");
                $(".center-badge").text("Good");

                setTimeout(function () {
                    nextSequence();
                }, 850);
            }
        } else {
            gameOver();
        }
    }

    function startGame() {
        gamePattern = [];
        userClickedPattern = [];
        level = 0;
        started = true;
        acceptingInput = false;

        $("#gameOver").hide();
        $("#startBtn").prop("disabled", true).text("Playing");
        $("#message").text("Get ready...");
        $(".center-badge").text("Ready");

        setTimeout(function () {
            nextSequence();
        }, 600);
    }

    function gameOver() {
        playSound("wrong");
        $("body").addClass("screen-error");

        setTimeout(function () {
            $("body").removeClass("screen-error");
        }, 340);

        acceptingInput = false;
        started = false;
        updateBestScore();

        $("#finalLevel").text(level);
        $("#message").text("Wrong color! Press Play Again to restart.");
        $(".center-badge").text("Over");
        $("#gameOver").css("display", "block");
        $("#startBtn").prop("disabled", false).text("Start Game");
    }

    $("#startBtn").click(function () {
        if (!started) {
            startGame();
        }
    });

    $("#playAgainBtn").click(function () {
        startGame();
    });

    $(".color-btn").click(function () {
        if (!started || !acceptingInput) {
            return;
        }

        const userChosenColor = $(this).data("color");

        userClickedPattern.push(userChosenColor);
        flashButton(userChosenColor, "pressed");
        playSound(userChosenColor);
        checkAnswer(userClickedPattern.length - 1);
    });
});
