<template>
  <button @click="backGame()">上一步</button><button @click="newGame()">新一局</button>
  <div>
    <template v-if="winPlayer!==PlayerNo">胜利玩家 ：{{ winPlayer }}</template>
    <template v-else-if="saveFlag.includes(PlayerNo)">下位玩家 ：{{ nextPlayer }}</template>
    <template v-else>平局</template>
  </div>
  <div class="tic-tac-toe-board">
    <div class="cell" v-for="index in range(9)" @click="newFlag(index)">
      {{ saveFlag[index] }}
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { not, range, charMask } from './util/util.vue';

const PlayerNo = " "
const PlayerA = "X"
const PlayerB = "O"
const WIN_MODE = [0b111000000, 0b000111000, 0b000000111, 0b100100100, 0b010010010, 0b001001001, 0b100010001, 0b001010100]

let saveFlag = ref([..." ".repeat(9)])
let nextPlayer = ref(PlayerA)
let winPlayer = ref(PlayerNo)
let history = []

function newFlag(index) {
  if( 
    not(saveFlag.value.includes(PlayerNo))||
    not(saveFlag.value[index]===PlayerNo) ||
    not(winPlayer.value===PlayerNo)
  ){return}
  history.push([[...saveFlag.value], nextPlayer.value, winPlayer.value])
  saveFlag.value.splice(index, 1, nextPlayer.value)
  nextPlayer.value = nextPlayer.value === PlayerA ? PlayerB : PlayerA
  WIN_MODE.forEach(mode=>{
    if((charMask(saveFlag.value,PlayerA)&mode)===mode){
      winPlayer.value=PlayerA
    }else if((charMask(saveFlag.value,PlayerB)&mode)===mode)(
      winPlayer.value=PlayerB
    )
  })
}

function newGame() {
  saveFlag.value = [..." ".repeat(9)]
  nextPlayer.value = PlayerA
  winPlayer.value =PlayerNo
  history=[]
}

function backGame() {
  [saveFlag.value, nextPlayer.value, winPlayer.value] = history.pop() ?? [saveFlag.value, nextPlayer.value, winPlayer.value]
}

</script>

<style scoped>
.tic-tac-toe-board {
  display: grid;
  grid: repeat(3, 1fr)/repeat(3, 1fr);
}

.cell {
  user-select: none;
  outline: 1px solid #333;
  width: 100px;
  height: 100px;
  font-size: 100px;
  line-height: 100%;
}
</style>