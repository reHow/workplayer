import { createStore } from "vuex";

export default createStore({
    state: {
        count: "hello"
    },
    mutations: {
        increment(state) {
            state.count = "world"
        }
    }
})