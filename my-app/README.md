## Purpose of this project: 
Mini story editor where u can write title name , paragprahs. You can use some styling bold and italic and use bullet points. Last but not least u can put images into ur story editor. You have 2 choices one to use link( from google or any other source) other way u can just paste image from ur desktop or drag and drop from ur file directory. Small features I added were load last story where it loads ur last saved story from ur storage (local storage in my case) also i added image resizing. 

## How to run and set up 
npm i
npm start
## Build 
npm run build
## Project structure explanation 
We have myEditor with all the logic and function of this project 
Toast.jsx is for toast messages instead of using alert. It looks tidier and more UI/UX friendly 
ImageValidation as the name suggest checks if images fits certain requirements set in the code(can be changed)
ImageResize resizies images using %width of the orginal image 
App.js used to run and render the code
