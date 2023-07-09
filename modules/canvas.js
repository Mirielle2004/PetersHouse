/**
 * Create and set up canvas
 * 
 * @param {string} id Id for canvas
 * @param {HTMLElement} parent HTML container element 
 * @param {number} scale Scale factor of canvas, (0; 1]
 * @param {number} ratio Aspect ratio of canvas
 * 
 * @description Create canvas element in parent with specified scale factor and aspect ratio.
 * 
 * @returns Canvas is appended as child of parent. Return 2d context of canvas.
 */
function createCanvas(id, parent, scale = 0.9, ratio = 1/1) {
    // create and scale
    let cnv = document.createElement('canvas');
    cnv.id = id;
    cnv.width = cnv.height = Math.min(parent.offsetWidth, parent.offsetHeight);
    cnv.width *= ratio;
    let sc = Math.max(cnv.width/ parent.offsetWidth, cnv.height / parent.offsetHeight);
    cnv.width *= (1 + (1 - sc))*scale;
    cnv.height *= (1 + (1 - sc))*scale;
    parent.appendChild(cnv);
    return cnv.getContext('2d');
}



export { createCanvas };