class UI {
    constructor(field) {
        this.field = field;
        this.top_score = 0;
        this.days = 10000;

        $("#start_game").addEventListener("click", function() {
            let new_game_id = guid();
            let path = location.path || "";

            document.location.href = "?game=" + new_game_id;
        });

        $("#user_alias").addEventListener("change", () => {
            this.updateUserInfo({ alias: $("#user_alias").value });
        });

        let url = new URL(document.location.href);
        let game_code = url.searchParams.get("game");

        if (game_code) createCookie("game_code", game_code, this.days);
        else eraseCookie("game_code");

        this.promise = new Promise((resolve, reject) => {
            resolve();
        });
        // this.promise = getJSON(
        //     window.api_url + "api/get_user_info",
        //     {},
        //     data => {
        //         if (data.alias) {
        //             $("#user_alias").value = data.alias;
        //         }
        //         createCookie("user_code", data.user_code, this.days);
        //         this.user_code = data.user_code;

        //         this.top_score = data.top_score;

        //         if (data.map) {
        //             this.field.unpack_map(data.map);
        //         }
        //     },
        //     error => {
        //         // this.showMessage(error);
        //         if (!checkCookie("top_score")) {
        //             createCookie("top_score", this.top_score, this.days);
        //         }
        //         this.top_score = readCookie("top_score");
        //     },
        //     () => {
        //         this.updateTopScore(this.top_score, false);
        //     }
        // );
    }

    when_done(callback) {
        this.promise.then(() => callback());
    }

    updateSpeedLevel(value) {
        $("#speed_value").innerHTML = value;
    }

    updateScore(value) {
        $("#score_value").innerHTML = value;

        if (value > this.top_score) {
            this.updateTopScore(value);
        }
    }

    updateTopScore(value, update_server = true) {
        this.top_score = value;
        $("#top_score_value").innerHTML = value;
        createCookie("top_score", value, this.days);

        if (update_server) {
            this.updateUserInfo({ top_score: value });
        }
    }

    updateUserInfo(data) {
        getJSON(window.api_url + "api/update_user_info", data, null, msg => {
            msg.error && this.showMessage(msg.error);
        });
    }

    gameOver() {
        let z = this.field.depth / this.field.step;

        let handler = () => {
            this.field.map[z] = this.field.empty_level();
            this.field.draw_grid();
            this.field.draw();
            if (--z >= 0) {
                setTimeout(handler, 50);
            } else {
                $(".message span").innerHTML = "Game Over";
                $(".message").style.display = "block";
            }
        };
        handler();
    }

    showMessage(message) {
        $(".message span").innerHTML = message;
        $(".message").style.display = "block";
        $(".message").className += " error";
    }

    hideMessage() {
        $(".message").style.display = "none";
    }
}
