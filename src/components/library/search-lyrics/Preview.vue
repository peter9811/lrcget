<template>
  <BaseModal
    title="Preview"
    content-class="w-full h-[60vh] max-w-screen-md"
    body-class="flex flex-col gap-4 h-full min-h-0"
    @close="emit('close')"
  >
    <div class="flex flex-none gap-4 items-center bg-brave-95 dark:bg-brave-10 rounded-lg px-4 py-2">
      <button v-if="status !== 'playing'" @click.prevent="resume" class="button button-primary text-white p-2 rounded-full text-xl"><Play /></button>
      <button v-else @click.prevent="pause" class="button button-primary text-white p-2 rounded-full text-xl"><Pause /></button>
      <div class="flex-none w-12 text-xs text-brave-30 dark:text-brave-95">{{ humanDuration(progress) }}</div>
      <Seek class="grow" :duration="duration" :progress="progress" @seek="seek" />
      <div class="flex-none w-12 text-xs text-brave-30 dark:text-brave-95">{{ humanDuration(duration) }}</div>
    </div>

    <div v-if="props.lyrics.syncedLyrics" class="relative grow h-full overflow-hidden">
      <div id="full-lyrics-container" class="h-full text-center transition" :style="{ transform: fullViewTransform }">
        <p v-for="(line, index) in parsedLyrics" :key="index" class="text-brave-50 dark:text-brave-95" :class="{ 'font-bold': currentIndex === index }">{{ line.content }}</p>
      </div>

      <div class="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-white dark:from-brave-5"></div>
      <div class="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white dark:from-brave-5"></div>
    </div>

    <div v-else-if="props.lyrics.plainLyrics" class="relative grow text-center text-brave-50 whitespace-pre h-full overflow-hidden">
      <div class="grow p-4 h-full overflow-y-auto">
        {{ props.lyrics.plainLyrics }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Loading, Play, Pause } from 'mdue'
import { usePlayer } from '@/composables/player.js'
import { Lrc, Runner } from 'lrc-kit'
import Seek from '@/components/now-playing/Seek.vue'

const props = defineProps(['track', 'lyrics'])
const { playingTrack, status, duration, progress, playTrack, pause, resume, stop, seek } = usePlayer()
const emit = defineEmits(['close'])

const runner = ref(null)
const parsedLyrics = ref(null)
const currentIndex = ref(null)
const currentLyrics = ref(null)
const currentLineElementOffset = ref(null)

const humanDuration = (seconds) => {
  if (!seconds) {
    seconds = 0
  }

  return new Date(seconds * 1000).toISOString().slice(11, 19)
}

const updateCurrentLineElementOffset = (newCurrentIndex) => {
  if (newCurrentIndex === null) {
    newCurrentIndex = -1
  }

  if (newCurrentIndex === -1) {
    currentLineElementOffset.value = null
    return
  }

  const fullLyricsContainerEl = document.getElementById('full-lyrics-container')
  if (fullLyricsContainerEl) {
    const currentLyricsLine = Array.from(fullLyricsContainerEl.children)[newCurrentIndex]
    currentLineElementOffset.value = currentLyricsLine.offsetTop
  }
}

const fullViewTransform = computed(() => {
  if (!currentLineElementOffset.value) {
    return `translateY(calc(50% - 2.5em))`
  }

  return `translateY(calc(50% - 2.5em - ${currentLineElementOffset.value}px))`
})

onMounted(() => {
  playTrack(props.track)

  if (props.lyrics.syncedLyrics) {
    const parsed = Lrc.parse(props.lyrics.syncedLyrics)

    runner.value = new Runner(parsed)
    parsedLyrics.value = runner.value.getLyrics()
  }
})

onUnmounted(() => {
  stop()
  runner.value = null
  parsedLyrics.value = null
})

watch(progress, (newProgress) => {
  if (!runner.value || !props.lyrics) {
    return
  }

  runner.value.timeUpdate(newProgress)
  let resultCurrentIndex = runner.value.curIndex()

  if (resultCurrentIndex === null) {
    resultCurrentIndex = -1
  }

  currentIndex.value = resultCurrentIndex

  if (currentIndex.value === -1) {
    currentLyrics.value = '…'
    return
  }

  try {
    const currentLyricsObj = runner.value.getLyric(resultCurrentIndex)
    currentLyrics.value = currentLyricsObj.content
  } catch (error) {
    console.error(error)
  }
})

watch(currentIndex, (newCurrentIndex) => {
  updateCurrentLineElementOffset(newCurrentIndex)
})

</script>
