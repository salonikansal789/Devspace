import Search from './modules/search'
import Chat from './modules/chat'


// new Search()

if(document.querySelector(".header-search-icon")) {
    new Search()
}

if(document.querySelector("#chat-wrapper")) {
    new Chat()
}