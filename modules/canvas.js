/**
 * Create and set up canvas
 * 
 * @param {string} id Id for canvas
 * @param {HTMLElement} parent HTML container element 
 * @param {number} aspW Width
 * @param {number} aspH Height
 * @param {number} scale Scale factor of canvas; (0; 1]; 1 is max screen fit
 * 
 * @description Create canvas element in parent with specified scale factor and aspect ratio.
 * 
 * @returns Canvas is appended as child of parent. Return 2d context of canvas.
 */
function createCanvas(id, parentElem, aspW = 2, aspH = 3, scale = 1) {
    // canvas element
    let cnv = document.createElement('canvas');
    cnv.id = id;
    // parent dim
    const parentW = parentElem.clientWidth, parentH = parentElem.clientHeight;
    const parentAsp = parentW / parentH;
    // element dim
    const cnvAsp = aspW / aspH;
    // determine new dim
    let cnvWidth, cnvHeight;
    if (parentAsp > cnvAsp) {
    cnvHeight = parentH; 
    cnvWidth = cnvHeight * cnvAsp;
    }
    else {
    cnvWidth = parentW; 
    cnvHeight = cnvWidth / cnvAsp;
    }
    //
    cnv.width = cnvWidth * scale;
    cnv.height = cnvHeight * scale;
    
    parentElem.appendChild(cnv);
    return [cnv, cnv.getContext('2d')];
}



export { createCanvas };