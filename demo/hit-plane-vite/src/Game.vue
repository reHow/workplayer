<template>
  <div @click="increment()">count value:{{ count }}&lt;-has or not has</div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()

    return {
      count: computed(() => store.state.count),
      increment:()=>store.commit('increment')
    }
  }
}
</script>

<style scoped></style>
