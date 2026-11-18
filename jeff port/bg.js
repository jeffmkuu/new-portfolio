/* Live coding background: real code types itself out in columns, like editors running behind the page */
(function () {
    var canvas = document.getElementById("bg-canvas");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Choose the background: "network" (cyan dots and lines) or "code" (typing code) */
    var BACKGROUND = "network";

    /* ---------- 1. CODE TYPING BACKGROUND ---------- */

    var snippets = [
        [
            "# sales_report.py",
            "import pandas as pd",
            "",
            "def total_sales(rows):",
            "    total = 0",
            "    for sale in rows:",
            "        total += sale['price'] * sale['qty']",
            "    return total",
            ""
        ],
        [
            "<?php",
            "// Ask My Business",
            "function getBusinessAnswer($q, $id) {",
            "    $sql = \"SELECT SUM(total) FROM sales\";",
            "    $result = $conn->query($sql);",
            "    return $result->fetch_assoc();",
            "}",
            "?>",
            ""
        ],
        [
            "from flask import Flask, request",
            "",
            "app = Flask(__name__)",
            "",
            "@app.route('/sales', methods=['POST'])",
            "def add_sale():",
            "    data = request.get_json()",
            "    stock = stock - data['qty']",
            "    return {'status': 'saved'}",
            ""
        ],
        [
            "-- school database",
            "CREATE TABLE students (",
            "    id INT PRIMARY KEY,",
            "    name VARCHAR(80),",
            "    class VARCHAR(20)",
            ");",
            "SELECT name, marks FROM results",
            "WHERE subject = 'Maths';",
            ""
        ],
        [
            "<section id=\"projects\">",
            "    <h2>My Projects</h2>",
            "    <div class=\"project\">",
            "        <p>Building things that work</p>",
            "    </div>",
            "</section>",
            ""
        ],
        [
            "const form = document.getElementById('form');",
            "form.addEventListener('submit', async (e) => {",
            "    e.preventDefault();",
            "    const res = await fetch(url);",
            "    if (res.ok) { alert('Sent'); }",
            "});",
            ""
        ],
        [
            "$ ping 192.168.1.1",
            "64 bytes from 192.168.1.1: ttl=64",
            "$ ipconfig /all",
            "$ python manage.py runserver",
            "Server running on port 5000",
            ""
        ]
    ];

    var colors = {
        comment: "#5f8f8f",
        string: "#7cffb2",
        keyword: "#00ffff",
        number: "#ffb86c",
        tag: "#ff79c6",
        plain: "#cfe8e8"
    };

    var tokenRe = /(\/\/.*|#.*|--.*)|("[^"]*"|'[^']*')|\b(def|import|from|return|if|else|elif|for|in|while|class|function|echo|SELECT|FROM|WHERE|CREATE|TABLE|PRIMARY|KEY|INT|VARCHAR|SUM|const|let|var|new|public|private|static|foreach|as|and|or|not|True|False|None|null|try|except|await|async)\b|(\b\d+\b)|(<\/?[a-zA-Z0-9?]+|\?>|>)/g;

    var ctx, fontSize, lineH, charW, rows, colCount, colW, cols = [];

    function nextLine(col) {
        var snip = snippets[col.snip];
        col.full = snip[col.line];
        col.line++;
        if (col.line >= snip.length) {
            col.line = 0;
            col.snip = (col.snip + 1) % snippets.length;
        }
        col.cur = "";
        col.pos = 0;
        col.wait = 0;
    }

    function pushLine(col) {
        col.lines.push(col.full);
        if (col.lines.length >= rows - 1) { col.lines.shift(); }
    }

    function buildColumns() {
        cols = [];
        for (var i = 0; i < colCount; i++) {
            var col = {
                lines: [],
                cur: "",
                full: "",
                pos: 0,
                wait: 0,
                snip: Math.floor(Math.random() * snippets.length),
                line: 0,
                speed: 0.5 + Math.random() * 0.7
            };
            // Fill the screen first so it never looks empty
            nextLine(col);
            for (var r = 0; r < rows - 3; r++) {
                pushLine(col);
                nextLine(col);
            }
            cols.push(col);
        }
    }

    function drawCode(text, x, y) {
        var last = 0;
        var m;
        tokenRe.lastIndex = 0;
        while ((m = tokenRe.exec(text)) !== null) {
            if (m.index > last) {
                ctx.fillStyle = colors.plain;
                ctx.fillText(text.slice(last, m.index), x + last * charW, y);
            }
            var color = colors.plain;
            if (m[1]) color = colors.comment;
            else if (m[2]) color = colors.string;
            else if (m[3]) color = colors.keyword;
            else if (m[4]) color = colors.number;
            else if (m[5]) color = colors.tag;
            ctx.fillStyle = color;
            ctx.fillText(m[0], x + m.index * charW, y);
            last = m.index + m[0].length;
            if (m[0].length === 0) { tokenRe.lastIndex++; }
        }
        if (last < text.length) {
            ctx.fillStyle = colors.plain;
            ctx.fillText(text.slice(last), x + last * charW, y);
        }
    }

    function render(showCaret) {
        ctx.fillStyle = "#021111";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + "px monospace";
        ctx.textBaseline = "alphabetic";

        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            var x = i * colW + 18;
            for (var r = 0; r < col.lines.length; r++) {
                drawCode(col.lines[r], x, (r + 1) * lineH);
            }
            var y = (col.lines.length + 1) * lineH;
            drawCode(col.cur, x, y);
            if (showCaret) {
                ctx.fillStyle = "#00ffff";
                ctx.fillRect(x + col.cur.length * charW + 2, y - fontSize + 2, charW * 0.7, fontSize);
            }
        }
    }

    function update() {
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];
            if (col.pos >= col.full.length) {
                col.wait++;
                if (col.wait > 8) {
                    pushLine(col);
                    nextLine(col);
                }
            } else {
                col.pos += col.speed * (1 + Math.random());
                col.cur = col.full.slice(0, Math.floor(col.pos));
            }
        }
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx = canvas.getContext("2d");

        fontSize = canvas.width < 700 ? 12 : 14;
        lineH = Math.round(fontSize * 1.7);
        ctx.font = fontSize + "px monospace";
        charW = ctx.measureText("M").width;
        rows = Math.floor(canvas.height / lineH);

        // 1 column on phones, more as the screen gets wider
        colCount = Math.max(1, Math.floor(canvas.width / 400));
        colW = canvas.width / colCount;

        buildColumns();
        render(false);
    }

    function startBackground() {
        if (!canvas) return;
        window.addEventListener("resize", resize);
        resize();

        if (reduceMotion) { return; }   // still picture only, no animation

        var last = 0;
        var tick = 0;
        function loop(time) {
            if (!document.hidden && time - last > 50) {   // about 20 frames per second
                update();
                tick++;
                render(Math.floor(tick / 10) % 2 === 0);  // blinking caret
                last = time;
            }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    /* ---------- 1b. NETWORK BACKGROUND (cyan only, matches the portfolio colours) ---------- */

    function startNetworkBackground() {
        if (!canvas) return;
        canvas.style.opacity = "0.75";   // the dots and lines are already soft

        var c = canvas.getContext("2d");
        var nodes = [];
        var mouse = { x: -9999, y: -9999 };
        var linkDist = 150;
        var mouseDist = 190;

        function build() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            var count = Math.min(90, Math.floor((canvas.width * canvas.height) / 16000));
            nodes = [];
            for (var i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    r: 1.5 + Math.random() * 1.5
                });
            }
            draw(false);
        }

        function draw(move) {
            c.fillStyle = "#021111";
            c.fillRect(0, 0, canvas.width, canvas.height);

            var i, j, a, b, dx, dy, d, alpha;

            if (move) {
                for (i = 0; i < nodes.length; i++) {
                    a = nodes[i];
                    a.x += a.vx;
                    a.y += a.vy;
                    if (a.x < 0 || a.x > canvas.width) { a.vx = -a.vx; }
                    if (a.y < 0 || a.y > canvas.height) { a.vy = -a.vy; }
                }
            }

            c.lineWidth = 1;

            // Lines between dots that are close to each other
            for (i = 0; i < nodes.length; i++) {
                a = nodes[i];
                for (j = i + 1; j < nodes.length; j++) {
                    b = nodes[j];
                    dx = a.x - b.x;
                    dy = a.y - b.y;
                    d = Math.sqrt(dx * dx + dy * dy);
                    if (d < linkDist) {
                        alpha = (1 - d / linkDist) * 0.45;
                        c.strokeStyle = "rgba(0, 255, 255, " + alpha + ")";
                        c.beginPath();
                        c.moveTo(a.x, a.y);
                        c.lineTo(b.x, b.y);
                        c.stroke();
                    }
                }

                // Lines to the mouse or finger
                dx = a.x - mouse.x;
                dy = a.y - mouse.y;
                d = Math.sqrt(dx * dx + dy * dy);
                if (d < mouseDist) {
                    alpha = (1 - d / mouseDist) * 0.7;
                    c.strokeStyle = "rgba(0, 255, 255, " + alpha + ")";
                    c.beginPath();
                    c.moveTo(a.x, a.y);
                    c.lineTo(mouse.x, mouse.y);
                    c.stroke();
                }
            }

            // The dots
            c.fillStyle = "rgba(0, 255, 255, 0.85)";
            for (i = 0; i < nodes.length; i++) {
                a = nodes[i];
                c.beginPath();
                c.arc(a.x, a.y, a.r, 0, Math.PI * 2);
                c.fill();
            }
        }

        window.addEventListener("resize", build);
        window.addEventListener("mousemove", function (e) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener("touchmove", function (e) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }, { passive: true });
        window.addEventListener("touchend", function () {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        build();

        if (reduceMotion) { return; }   // still picture only, no animation

        var last = 0;
        function loop(time) {
            if (!document.hidden && time - last > 33) {   // about 30 frames per second
                draw(true);
                last = time;
            }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    /* ---------- 2. TYPING TAGLINE IN THE HERO ---------- */

    function startTagline() {
        var el = document.getElementById("typed");
        if (!el) return;

        var phrases = [
            "Web Developer",
            "Python Programmer",
            "AI Enthusiast",
            "IT Support & Systems Admin"
        ];

        if (reduceMotion) {
            el.textContent = phrases[0];
            return;
        }

        var p = 0;
        var c = 0;
        var deleting = false;

        function step() {
            var word = phrases[p];
            if (!deleting) {
                c++;
                el.textContent = word.slice(0, c);
                if (c === word.length) {
                    deleting = true;
                    setTimeout(step, 1700);
                    return;
                }
                setTimeout(step, 90);
            } else {
                c--;
                el.textContent = word.slice(0, c);
                if (c === 0) {
                    deleting = false;
                    p = (p + 1) % phrases.length;
                    setTimeout(step, 400);
                    return;
                }
                setTimeout(step, 45);
            }
        }
        step();
    }

    if (BACKGROUND === "code") {
        startBackground();
    } else {
        startNetworkBackground();
    }
    startTagline();
})();
