// Dział „Dźwięk” Sowiego Laboratorium: suwaki głośności (zapis w profilu), muzyka, efekty, ściszanie, wibracje.
import { connectAudioSettings, createAudio } from "../shared/engine/index.js";

const AUDIO_BASE = new URL("../assets/audio/", import.meta.url).href;

export async function createSoundPanel({ root }) {
  const manifest = await fetch(new URL("audio.json", AUDIO_BASE).href).then((response) => {
    if (!response.ok) throw new Error(`audio.json: ${response.status}`);
    return response.json();
  });
  const audio = createAudio({ manifest, baseUrl: AUDIO_BASE });
  audio.bindUnlock(window);
  const saveSettings = connectAudioSettings(audio);
  const status = root.querySelector("[data-audio-status]");
  const sfxButtons = root.querySelector("[data-sfx-buttons]");
  const total = Object.keys(manifest.sfx).length;

  // Przyciski efektów z manifestu (podpisy po polsku).
  for (const [name, item] of Object.entries(manifest.sfx)) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.sfx = name;
    button.textContent = item.label;
    sfxButtons.append(button);
  }

  const glide = { handle: null };

  async function play(name, options) {
    await audio.unlock();
    await audio.preload([name]);
    if (name === "szybowanie") {
      const button = root.querySelector('[data-sfx="szybowanie"]');
      if (glide.handle) {
        glide.handle.stop(0.3);
        glide.handle = null;
        button.setAttribute("aria-pressed", "false");
        return;
      }
      glide.handle = audio.play(name, options);
      button.setAttribute("aria-pressed", String(Boolean(glide.handle)));
      return;
    }
    audio.play(name, options);
    if (name.startsWith("trafienie")) audio.vibrate([40, 30, 40]);
  }

  root.addEventListener("click", async (event) => {
    const sfx = event.target.closest("[data-sfx]");
    if (sfx) return play(sfx.dataset.sfx);
    const track = event.target.closest("[data-music]");
    if (track) {
      await audio.unlock();
      await audio.playMusic(track.dataset.music);
      return;
    }
    const action = event.target.closest("[data-audio-action]")?.dataset.audioAction;
    if (action === "stop") audio.stopMusic();
    else if (action === "duck") {
      if (audio.state().ducked) audio.unduck();
      else audio.duck(0.3);
    } else if (action === "vibration") {
      audio.setVibration(!audio.state().vibration);
      saveSettings({ vibration: audio.state().vibration });
      audio.vibrate(40);
    } else if (action === "combo") {
      // Seria liści: każdy kolejny o pół tonu wyżej (jak combo w grze).
      await audio.unlock();
      await audio.preload(["lisc"]);
      for (let index = 0; index < 8; index += 1) {
        setTimeout(() => audio.play("lisc", { pitch: 2 ** (index / 12) }), index * 110);
      }
    }
  });

  for (const input of root.querySelectorAll("[data-volume]")) {
    const bus = input.dataset.volume;
    input.addEventListener("input", () => {
      audio.setVolume(bus, input.value);
      const key = { master: "volumeMaster", music: "volumeMusic", sfx: "volumeSfx" }[bus];
      saveSettings({
        [key]: audio.volume(bus),
        ...(bus === "music" ? { music: true } : bus === "sfx" ? { sfx: true } : {}),
      });
    });
  }

  function render(state = audio.state()) {
    for (const input of root.querySelectorAll("[data-volume]")) {
      const value = state.volumes[input.dataset.volume];
      if (document.activeElement !== input) input.value = String(value);
      root.querySelector(`[data-volume-value="${input.dataset.volume}"]`).textContent = String(value);
    }
    for (const button of root.querySelectorAll("[data-music]")) {
      button.setAttribute("aria-pressed", String(state.music === button.dataset.music));
    }
    root.querySelector('[data-audio-action="duck"]').setAttribute("aria-pressed", String(state.ducked));
    const vibration = root.querySelector('[data-audio-action="vibration"]');
    vibration.setAttribute("aria-pressed", String(state.vibration));
    vibration.disabled = !audio.canVibrate();
    const context =
      { running: "działa", suspended: "wstrzymany", closed: "zamknięty", brak: "czeka na dotknięcie" }[state.context] ||
      state.context;
    status.textContent = `Dźwięk: ${context} · efekty wczytane: ${state.loaded}/${total}${state.music ? ` · muzyka: ${state.music}` : ""}${state.session ? ` · sesja: ${state.session}` : ""}`;
  }
  audio.onChange(render);
  render();
  return { audio, render, stopAll: () => audio.stopMusic({ fade: 0.3 }) };
}
