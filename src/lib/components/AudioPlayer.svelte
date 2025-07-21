<script>
    let { src } = $props();

    let currentTime = $state(0);
	let duration = $state(1);
	let paused = $state(true);
    let volume = $state(0.5);

	function format(time) {
        if (isNaN(time)) return "--:--";

		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);

		return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
	}
</script>

<audio
    {src}
    bind:currentTime
    bind:duration
    bind:paused
    bind:volume
></audio>

<div class="main">
    <button
        aria-label={paused ? 'play' : 'pause'}
		onclick={() => paused = !paused}
    ></button>
    <div class="time">
        <div class="current-time">{format(currentTime)}</div>
        <div
            class="slider"
            style="--progress: {currentTime / duration * 100}%"
            role="slider"
            aria-valuenow={currentTime}
            tabindex=0
            onpointerdown={e => {
                const div = e.currentTarget;

                function seek(e) {
                    const { left, width } = div.getBoundingClientRect();

                    let x = (e.clientX - left) / width;
                    if (x < 0) x = 0;
                    if (x > 1) x = 1;

                    let calculatedTime = Math.round(x * duration);
                    currentTime = isFinite(calculatedTime) ? calculatedTime : 0;
                }

                seek(e);

                window.addEventListener("pointermove", seek);

                window.addEventListener("pointerup", () => {
                    window.removeEventListener("pointermove", seek);
                }, {
                    once: true
                });
            }}
            onkeydown={e => {
                if (e.key === "ArrowRight") {
                    currentTime = Math.min(duration, currentTime + 10);
                }
                else if (e.key === "ArrowLeft") {
                    currentTime = Math.max(0, currentTime - 10);
                }
            }}
        ></div>
        <div class="duration">{duration && !isNaN(duration) && isFinite(duration) ? format(duration) : "--:--"}</div>
    </div>
</div>

<style>
    .main {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        height: 2rem;
        border-radius: 100rem;
    }

    button {
        position: relative;
        width: 2rem;
        height: 2rem;
        padding: 0;
        border: 0.125rem solid var(--color-main);
        border-radius: 100rem;
        box-sizing: border-box;
        background: var(--color-bg);
        transition: all 100ms ease-in-out;
        cursor: pointer;
        overflow: hidden;
    }

    button:hover {
        background: var(--color-main);
    }

    button::after{
        position: absolute;
        content: "";
        top: 0;
        left: 0;
        width: 0.75rem;
        height: 0.75rem;
        margin: calc((100% - 0.75rem) / 2);
        -webkit-mask-size: 0.75rem;
        mask-size: 0.75rem;
        background: var(--color-main);
        transition: all 100ms ease-in-out;
    }

    button:hover::after {
        background: var(--color-bg);
    }

    button[aria-label="pause"]::after {
		-webkit-mask-image: url(/icons/pause.svg);
        mask-image: url(/icons/pause.svg);
	}

	button[aria-label="play"]::after {
		-webkit-mask-image: url(/icons/play.svg);
        mask-image: url(/icons/play.svg);
	}

    .time {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1 1 auto;
    }

    .current-time {
        min-width: 3rem;
        text-align: right;
    }

    .slider {
        position: relative;
        flex: 1 1 auto;
        height: 0.5rem;
        border-radius: 100rem;
        background: rgba(var(--color-main-values), 50%);
        overflow: hidden;
    }

    .slider::after {
        position: absolute;
        content: "";
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--color-main) var(--progress),
            transparent var(--progress),
            transparent);
    }
</style>