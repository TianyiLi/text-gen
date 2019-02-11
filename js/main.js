function getPairs (child = {}, parents = '') {
  if (child instanceof Array) {
    return child.reduce((prev, ele, index) => {
      return Object.assign(prev, getPairs(ele, `${parents}[${index}]`))
    }, {})
  } else if (typeof child !== 'object') {
    return { [`${parents}`]: child }
  } else {
    return Object.entries(child).reduce((prev, [key, obj]) => {
      return Object.assign(
        prev,
        getPairs(obj, `${parents !== '' ? parents + '.' : parents}${key}`)
      )
    }, {})
  }
}

const app = new Vue({
  el: '#app',
  data: {
    basic: {},
    compared: {},
    header: new Set(),
    line: [],
    startCompare: false,
    result: '',
    basicLocale: '',
    comparedLocale: 'sample.json',
    downloadLink: '',
    errorLine: new Set()
  },
  methods: {
    onConfirm: function () {
      if (this.errorLine.size) {
        let _c = confirm('All the elements still not fill of, start the generate?')
        if (!_c) return
      }
      this.result = JSON.stringify(
        this.line.reduce((prev, curr) => {
          return _.set(prev, curr.head, curr.input)
        }, {}),
        null,
        4
      )
      // let _h = document.getElementById('result')
      // let { offsetTop } = _h
      // window.document.documentElement.scrollTop = offsetTop
      let result = this.result
      let mime_type = 'test/plain'
      let _b = new Blob([result], { type: mime_type })
      this.downloadLink = URL.createObjectURL(_b)
      this.$nextTick(() => {
        document.getElementById('download').click()
      })
    },
    checkLineOK (i) {
      let {line1, input} = this.line[i]
      if (line1 === '' || input === '') {
        this.errorLine.add(i)
        return false
      } else {
        this.errorLine.delete(i)
        return true
      }
    },
    copy (i) {
      this.line[i].input = this.line[i].line1
    },
    readFile (event, isCompared = false) {
      console.log(event)
      let file = event.target.files[0]
      let reader = new FileReader()
      let self = this
      reader.onload = e => {
        let pairs = getPairs(JSON5.parse(e.target.result))
        if (isCompared) {
          self.basic = pairs
          self.basicLocale = event.target.value.replace(/.*[\/\\]/, '').replace(/(.+)(?=\.json)/, '$1')
        } else {
          self.compared = pairs
          self.comparedLocale = event.target.value.replace(/.*[\/\\]/, '').replace(/(.+)(?=\.json)/, '$1')
        }
        Object.keys(pairs).forEach(p => self.header.add(p))
      }
      reader.readAsText(file, 'utf8')
    },
    startGenerate () {
      let line = []
      this.header.forEach((ele, i) => {
        line.push({
          head: ele,
          line1: this.basic[ele],
          input: this.compared[ele] || ''
        })
      })
      this.line = line
      this.startCompare = true
      emmet.require('textarea').setup({
        pretty_break: true, // enable formatted line breaks (when inserting
        // between opening and closing tag)
        use_tab: true // expand abbreviations by Tab key
      })
    }
  }
})