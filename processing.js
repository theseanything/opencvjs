class Steps {
  constructor (el) {
    this.el = el
    this.root = null
    this.last = null
  }

  addStep (step) {
    if ( this.root == null) {
      this.root = step
      this.last = step
    } else {
      this.last.next = step
      step.prev = this.last
      this.last = step
    }
    this.el.appendChild(step.div)
  }

  run () {
    this.root.run()
  }
}


class Step {
  constructor (params, src) {
    this.next = null
    this.prev = null
    this.rendered = null
    this.alt_src = src

    this.div = document.createElement('div')
    this.canvas = document.createElement('canvas')
    this.div.appendChild(this.canvas)
    this.inputs = []
    for (var key in params){
        var input = Object.assign(document.createElement('input'), params[key])
        var label = document.createElement('label')

        input.addEventListener('change', this.run.bind(this))
        label.innerHTML = key

        this.div.appendChild(label)
        this.div.appendChild(input)
        this.inputs.push(input)
    }
    this.run = this.run.bind(this)
  }

  get src () {
    return this.alt_src ? this.alt_src : this.prev.canvas
  }

  run () {
    this.process()
    this.show()
    if (this.next != null){
      this.next.run()
    }
  }

  process () {}

  show() {
    cv.imshow(this.canvas, this.rendered)
    this.rendered.delete()
  }

  get_value (input) {
    if (input.type === 'number' || input.type === 'range'){
      return parseInt(input.value)
    } else if (input.type === 'checkbox' ) {
      return input.checked
    }
  }

}

class BlurStep extends Step {
  constructor(src) {
    let params = {
      'blurDiameter': { value: 8, max:20, min:0, type: 'range' },
      'sigmaColor': { value: 250, type:'number' },
      'sigmaSpace': { value: 250, type:'number' }
    }
    super(params, src)
  }

  process() {
    let src = cv.imread(this.src)
    this.rendered = new cv.Mat()
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0)
    cv.bilateralFilter(
      src, this.rendered,
      ...this.inputs.map(this.get_value),
      cv.BORDER_DEFAULT
    )
    src.delete()
  }
}

class MaskStep extends Step {
  constructor(src) {
    let params = {
      'thresh': { value: 190, type: 'number' },
      'maxval': { value: 255, type:'number' }
    }
    super(params, src)
  }

  process () {
    let src = cv.imread(this.src)
    this.rendered = new cv.Mat()
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(
      src, this.rendered,
      ...this.inputs.map(this.get_value),
      cv.THRESH_BINARY)
    src.delete()
  }
}

class CannyStep extends Step {
  constructor(src) {
    let params = {
      'lowThresh': { value: 100000, type: 'number' },
      'highThresh': { value: 200000, type:'number' },
      'apertureSize': { value: 7, min: 3, max: 7, step: 2, type:'range' },
      'L2gradient': { type:'checkbox' }
    }
    super(params, src)
  }

  process () {
    let src = cv.imread(this.src)
    this.rendered = new cv.Mat()
    cv.Canny(
      src, this.rendered,
      ...this.inputs.map(this.get_value)
    )
    src.delete()
  }
}

class HoughPStep extends Step {
  constructor(src) {
    let params = {
      'houghThreshold': { value: 115, type: 'number' },
      'minLineLength': { value: 200, type:'number' },
      'maxLineGap': { value: 240, type:'number' },
    }
    super(params, src)
  }

  process () {
    let src = cv.imread(this.src)
    this.rendered = cv.imread(this.src)
    let lines = new cv.Mat()
    let color = new cv.Scalar(255, 255, 0)
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0)
    cv.HoughLinesP(
      src, lines,
      1, Math.PI / 180,
      ...this.inputs.map(this.get_value)
    )
    for (let i = 0; i < lines.rows; ++i) {
      let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
      let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
      cv.line(this.rendered, startPoint, endPoint, color, 3);
    }
    src.delete()
    lines.delete()
  }
}
