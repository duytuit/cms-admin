module.exports = {
  /**
   * Chủ đề tối của chủ đề của thanh bên theme-dark，Chủ đề ánh sáng theme-light
   */
  sideTheme: 'theme-dark',

  /**
   * Liệu cấu hình bố cục hệ thống
   */
  showSettings: false,

  /**
   * Có hiển thị điều hướng hàng đầu không
   */
  topNav: false,

  /**
   * Có hiển thị không tagsView
   */
  tagsView: true,

  /**
   * Có nên sửa đầu không
   */
  fixedHeader: false,

  /**
   * Có hiển thị không logo
   */
  sidebarLogo: true,

  /**
   * Có thể hiển thị một tiêu đề động
   */
  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production'
}
