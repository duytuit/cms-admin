export const formConf = {
  formRef: 'elForm',
  formModel: 'formData',
  size: 'medium',
  labelPosition: 'right',
  labelWidth: 100,
  formRules: 'rules',
  gutter: 15,
  disabled: false,
  span: 24,
  formBtns: true
}

export const inputComponents = [
  {
    label: 'input',
    tag: 'el-input',
    tagIcon: 'input',
    placeholder: 'Vui lòng nhập',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input'
  },
  {
    label: 'textarea',
    tag: 'el-input',
    tagIcon: 'textarea',
    type: 'textarea',
    placeholder: 'Vui lòng nhập',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    autosize: {
      minRows: 4,
      maxRows: 4
    },
    style: { width: '100%' },
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input'
  },
  {
    label: 'password',
    tag: 'el-input',
    tagIcon: 'password',
    placeholder: 'Vui lòng nhập',
    defaultValue: undefined,
    span: 24,
    'show-password': true,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    prepend: '',
    append: '',
    'prefix-icon': '',
    'suffix-icon': '',
    maxlength: null,
    'show-word-limit': false,
    readonly: false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input'
  },
  {
    label: 'input-number',
    tag: 'el-input-number',
    tagIcon: 'number',
    placeholder: '',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    min: undefined,
    max: undefined,
    step: undefined,
    'step-strictly': false,
    precision: undefined,
    'controls-position': '',
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/input-number'
  }
]

export const selectComponents = [
  {
    label: 'select',
    tag: 'el-select',
    tagIcon: 'select',
    placeholder: 'xin vui lòng chọn',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    clearable: true,
    disabled: false,
    required: true,
    filterable: false,
    multiple: false,
    options: [{
      label: 'lựa chọn 1',
      value: 1
    }, {
      label: 'Tùy chọn hai',
      value: 2
    }],
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/select'
  },
  {
    label: 'cascader',
    tag: 'el-cascader',
    tagIcon: 'cascader',
    placeholder: 'xin vui lòng chọn',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    props: {
      props: {
        multiple: false
      }
    },
    'show-all-levels': true,
    disabled: false,
    clearable: true,
    filterable: false,
    required: true,
    options: [{
      id: 1,
      value: 1,
      label: 'lựa chọn 1',
      children: [{
        id: 2,
        value: 2,
        label: 'lựa chọn 1-1'
      }]
    }],
    dataType: 'dynamic',
    labelKey: 'label',
    valueKey: 'value',
    childrenKey: 'children',
    separator: '/',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/cascader'
  },
  {
    label: 'radio-group',
    tag: 'el-radio-group',
    tagIcon: 'radio',
    defaultValue: undefined,
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    size: 'medium',
    disabled: false,
    required: true,
    options: [{
      label: 'lựa chọn 1',
      value: 1
    }, {
      label: 'Tùy chọn hai',
      value: 2
    }],
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/radio'
  },
  {
    label: 'checkbox-group',
    tag: 'el-checkbox-group',
    tagIcon: 'checkbox',
    defaultValue: [],
    span: 24,
    labelWidth: null,
    style: {},
    optionType: 'default',
    border: false,
    size: 'medium',
    disabled: false,
    required: true,
    options: [{
      label: 'lựa chọn 1',
      value: 1
    }, {
      label: 'Tùy chọn hai',
      value: 2
    }],
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/checkbox'
  },
  {
    label: 'switch',
    tag: 'el-switch',
    tagIcon: 'switch',
    defaultValue: false,
    span: 24,
    labelWidth: null,
    style: {},
    disabled: false,
    required: true,
    'active-text': '',
    'inactive-text': '',
    'active-color': null,
    'inactive-color': null,
    'active-value': true,
    'inactive-value': false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/switch'
  },
  {
    label: 'slider',
    tag: 'el-slider',
    tagIcon: 'slider',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    disabled: false,
    required: true,
    min: 0,
    max: 100,
    step: 1,
    'show-stops': false,
    range: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/slider'
  },
  {
    label: 'time-picker',
    tag: 'el-time-picker',
    tagIcon: 'time',
    placeholder: 'xin vui lòng chọn',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    'picker-options': {
      selectableRange: '00:00:00-23:59:59'
    },
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/time-picker'
  },
  {
    label: 'range-time-picker',
    tag: 'el-time-picker',
    tagIcon: 'time-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    'is-range': true,
    'range-separator': 'đến',
    'start-placeholder': 'Thời gian bắt đầu',
    'end-placeholder': 'Thời gian kết thúc',
    format: 'HH:mm:ss',
    'value-format': 'HH:mm:ss',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/time-picker'
  },
  {
    label: 'date-picker',
    tag: 'el-date-picker',
    tagIcon: 'date',
    placeholder: 'xin vui lòng chọn',
    defaultValue: null,
    type: 'date',
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    disabled: false,
    clearable: true,
    required: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/date-picker'
  },
  {
    label: 'range-date-picker',
    tag: 'el-date-picker',
    tagIcon: 'date-range',
    defaultValue: null,
    span: 24,
    labelWidth: null,
    style: { width: '100%' },
    type: 'daterange',
    'range-separator': 'đến',
    'start-placeholder': 'Ngày bắt đầu',
    'end-placeholder': 'Ngày kết thúc',
    disabled: false,
    clearable: true,
    required: true,
    format: 'yyyy-MM-dd',
    'value-format': 'yyyy-MM-dd',
    readonly: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/date-picker'
  },
  {
    label: 'rate',
    tag: 'el-rate',
    tagIcon: 'rate',
    defaultValue: 0,
    span: 24,
    labelWidth: null,
    style: {},
    max: 5,
    'allow-half': false,
    'show-text': false,
    'show-score': false,
    disabled: false,
    required: true,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/rate'
  },
  {
    label: 'color-picker',
    tag: 'el-color-picker',
    tagIcon: 'color',
    defaultValue: null,
    labelWidth: null,
    'show-alpha': false,
    'color-format': '',
    disabled: false,
    required: true,
    size: 'medium',
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/color-picker'
  },
  {
    label: 'upload',
    tag: 'el-upload',
    tagIcon: 'upload',
    action: 'https://jsonplaceholder.typicode.com/posts/',
    defaultValue: null,
    labelWidth: null,
    disabled: false,
    required: true,
    accept: '',
    name: 'file',
    'auto-upload': true,
    showTip: false,
    buttonText: 'Nhấp vào Tải lên',
    fileSize: 2,
    sizeUnit: 'MB',
    'list-type': 'text',
    multiple: false,
    regList: [],
    changeTag: true,
    document: 'https://element.eleme.cn/#/zh-CN/component/upload'
  }
]

export const layoutComponents = [
  {
    layout: 'rowFormItem',
    tagIcon: 'row',
    type: 'default',
    justify: 'start',
    align: 'top',
    label: 'Dòng',
    layoutTree: true,
    children: [],
    document: 'https://element.eleme.cn/#/zh-CN/component/layout'
  },
  {
    layout: 'colFormItem',
    label: 'button',
    changeTag: true,
    labelWidth: null,
    tag: 'el-button',
    tagIcon: 'button',
    span: 24,
    default: 'Nút chính',
    type: 'primary',
    icon: 'el-icon-search',
    size: 'medium',
    disabled: false,
    document: 'https://element.eleme.cn/#/zh-CN/component/button'
  }
]

// 组件rule的触发方式，无触发方式的组件不生成rule
export const trigger = {
  'el-input': 'blur',
  'el-input-number': 'blur',
  'el-select': 'change',
  'el-radio-group': 'change',
  'el-checkbox-group': 'change',
  'el-cascader': 'change',
  'el-time-picker': 'change',
  'el-date-picker': 'change',
  'el-rate': 'change'
}
