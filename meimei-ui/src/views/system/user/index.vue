<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--Dữ liệu bộ phận-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="deptName"
            placeholder="Vui lòng nhập tên của bộ phận"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="deptOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--Dữ liệu người dùng-->
      <el-col :span="20" :xs="24">
        <el-form
          :model="queryParams"
          ref="queryForm"
          size="small"
          :inline="true"
          v-show="showSearch"
          label-width="68px"
        >
          <el-form-item label="tên tài khoản" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="Vui lòng nhập tên tài khoản"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="SĐT" prop="phonenumber">
            <el-input
              v-model="queryParams.phonenumber"
              placeholder="Vui lòng nhập SĐT"
              clearable
              style="width: 240px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="Trạng thái" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="Trạng thái"
              clearable
              style="width: 240px"
            >
              <el-option
                v-for="dict in dict.type.sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Thời gian">
            <el-date-picker
              v-model="dateRange"
              style="width: 240px"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="Ngày bắt đầu"
              end-placeholder="Ngày kết thúc"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              >Tìm</el-button
            >
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
              >Làm mới</el-button
            >
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              plain
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPermi="['system:user:add']"
              >Thêm</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['system:user:edit']"
              >Sửa</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['system:user:remove']"
              >Xoá</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              plain
              icon="el-icon-upload2"
              size="mini"
              @click="handleImport"
              v-hasPermi="['system:user:import']"
              >Nhập Excel</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPermi="['system:user:export']"
              >Xuất Excel</el-button
            >
          </el-col>
          <right-toolbar
            :showSearch.sync="showSearch"
            @queryTable="getList"
            :columns="columns"
          ></right-toolbar>
        </el-row>

        <el-table
          v-loading="loading"
          :data="userList"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column
            label="tên người dùng"
            align="center"
            key="userId"
            prop="userId"
            v-if="columns[0].visible"
          />
          <el-table-column
            label="tên tài khoản"
            align="center"
            key="userName"
            prop="userName"
            v-if="columns[1].visible"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Biệt danh"
            align="center"
            key="nickName"
            prop="nickName"
            v-if="columns[2].visible"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="Phòng ban"
            align="center"
            key="deptName"
            prop="dept.deptName"
            v-if="columns[3].visible"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            label="SĐT"
            align="center"
            key="phonenumber"
            prop="phonenumber"
            v-if="columns[4].visible"
            width="120"
          />
          <el-table-column
            label="Trạng thái"
            align="center"
            key="status"
            v-if="columns[5].visible"
          >
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.status"
                active-value="0"
                inactive-value="1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column
            label="Thời gian"
            align="center"
            prop="createTime"
            v-if="columns[6].visible"
            width="160"
          >
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="Thao tác"
            align="center"
            width="160"
            class-name="small-padding fixed-width"
          >
            <template slot-scope="scope" v-if="scope.row.userId !== 1">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['system:user:edit']"
                >Sửa</el-button
              >
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:user:remove']"
                >Xoá</el-button
              >
              <el-dropdown
                size="mini"
                @command="(command) => handleCommand(command, scope.row)"
                v-hasPermi="['system:user:resetPwd', 'system:user:edit']"
              >
                <span class="el-dropdown-link">
                  <i class="el-icon-d-arrow-right el-icon--right"></i>Hơn
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    command="handleResetPwd"
                    icon="el-icon-key"
                    v-hasPermi="['system:user:resetPwd']"
                    >Làm mới mật khẩu mở khóa</el-dropdown-item
                  >
                  <el-dropdown-item
                    command="handleAuthRole"
                    icon="el-icon-circle-check"
                    v-hasPermi="['system:user:edit']"
                    >Gán vai trò</el-dropdown-item
                  >
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- Thêm hoặc Sửa Hộp thoại Cấu hình người dùng -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Biệt danh" prop="nickName">
              <el-input
                v-model="form.nickName"
                placeholder="Vui lòng nhập Biệt danh"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Bộ phận" prop="deptId">
              <treeselect
                v-model="form.deptId"
                :options="deptOptions"
                :show-count="true"
                placeholder="Vui lòng chọn bộ phận thuộc về"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="SĐT" prop="phonenumber">
              <el-input
                v-model="form.phonenumber"
                placeholder="Vui lòng nhập SĐT"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input
                v-model="form.email"
                placeholder="Vui lòng nhập email của bạn"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="tên tài khoản"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                placeholder="Vui lòng nhập tên tài khoản"
                maxlength="30"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.userId == undefined"
              label="mật khẩu người dùng"
              prop="password"
            >
              <el-input
                v-model="form.password"
                placeholder="Vui lòng nhập mật khẩu người dùng"
                type="password"
                maxlength="20"
                show-password
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Giới tính">
              <el-select v-model="form.sex" placeholder="Vui lòng chọn giới tính">
                <el-option
                  v-for="dict in dict.type.sys_user_sex"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="bưu kiện">
              <el-select
                v-model="form.postIds"
                multiple
                placeholder="Vui lòng chọn một bài đăng"
              >
                <el-option
                  v-for="item in postOptions"
                  :key="item.postId"
                  :label="item.postName"
                  :value="item.postId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Vai trò">
              <el-select
                v-model="form.roleIds"
                multiple
                placeholder="Vui lòng chọn vai trò"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.roleId"
                  :label="item.roleName"
                  :value="item.roleId"
                  :disabled="item.status == 1"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="Nhận xét">
              <el-input
                v-model="form.remark"
                type="textarea"
                placeholder="Vui lòng nhập nội dung"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Lưu lại</el-button>
        <el-button @click="cancel">Huỷ</el-button>
      </div>
    </el-dialog>

    <!-- người dùng Nhập Exce Hộp thoại -->
    <el-dialog
      :title="upload.title"
      :visible.sync="upload.open"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Kéo tệp ở đây, hoặc<em>Nhấp vào Tải lên</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" />
            Có nên cập nhật dữ liệu người dùng hiện có
          </div>
          <span>Chỉ cho phép Nhập Excel xls、xlsx Tệp định dạng.</span>
          <el-link
            type="primary"
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            @click="importTemplate"
            >Tải xuống mẫu</el-link
          >
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">Lưu lại</el-button>
        <el-button @click="upload.open = false">Huỷ</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  resetUserPwd,
  changeUserStatus,
} from "@/api/system/user";
import { getToken } from "@/utils/auth";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "User",
  dicts: ["sys_normal_disable", "sys_user_sex"],
  components: { Treeselect },
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Chọn mảng
      ids: [],
      // Không vô hiệu hóa
      single: true,
      // Không vô hiệu hóa
      multiple: true,
      // Tìm kiếm điều kiện, tình trạng, trạng thái
      showSearch: true,
      // Tổng số
      total: 0,
      // Dữ liệu bảng người dùng
      userList: null,
      // Tiêu đề lớp pop -up
      title: "",
      // Tùy chọn cây của bộ phận
      deptOptions: undefined,
      // Có hiển thị lớp pop -up
      open: false,
      // Tên bộ phận
      deptName: undefined,
      // mật khẩu mặc định
      initPassword: undefined,
      // Ngày tháng
      dateRange: [],
      // Tùy chọn công việc
      postOptions: [],
      // Tùy chọn ký tự
      roleOptions: [],
      // Biểu mẫu tham số
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
      },
      // người dùng Nhập Excel tham số
      upload: {
        // Có hiển thị lớp pop -up không (người dùngNhập Excel）
        open: false,
        // Tiêu đề của lớp pop -up (người dùng Nhập Excel）
        title: "",
        // Có nên tắt tải lên không
        isUploading: false,
        // Có nên cập nhật dữ liệu người dùng hiện có
        updateSupport: 0,
        // Đặt tiêu đề yêu cầu tải lên
        headers: { Authorization: "Bearer " + getToken() },
        // Đã tải lên địa chỉ
        url: process.env.VUE_APP_BASE_API + "/system/user/importData",
      },
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined,
      },
      // Thông tin cột
      columns: [
        { key: 0, label: `tên người dùng`, visible: true },
        { key: 1, label: `tên tài khoản`, visible: true },
        { key: 2, label: `Biệt danh`, visible: true },
        { key: 3, label: `Phòng ban`, visible: true },
        { key: 4, label: `SĐT`, visible: true },
        { key: 5, label: `Trạng thái`, visible: true },
        { key: 6, label: `Thời gian`, visible: true },
      ],
      // Hình thức xác minh
      rules: {
        userName: [
          { required: true, message: "tên tài khoản Không thể trống", trigger: "blur" },
          {
            min: 2,
            max: 20,
            message: "tên tài khoản độ dài phải từ 2 đến 20",
            trigger: "blur",
          },
        ],
        deptId: [
          { required: true, message: "Vui lòng chọn bộ phận thuộc về", trigger: "blur" },
        ],
        nickName: [
          { required: true, message: "Biệt danh người dùng không thể trống", trigger: "blur" },
        ],
        password: [
          { required: true, message: "Mật khẩu người dùng không thể trống", trigger: "blur" },
          {
            min: 5,
            max: 20,
            message: "Độ dài mật khẩu người dùng phải từ 5 đến 20",
            trigger: "blur",
          },
        ],
        email: [
          {
            type: "email",
            message: "Vui lòng nhập đúng địa chỉ email",
            trigger: ["blur", "change"],
          },
        ],
        phonenumber: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "Vui lòng nhập đúng SĐT",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    // Sàng lọc cây theo tên
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getConfigKey("sys.user.initPassword").then((response) => {
      this.initPassword = response.data;
    });
  },
  methods: {
    /** Danh sách người dùng truy vấn */
    getList() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** Cấu trúc cây của bộ phận yêu cầu */
    getTreeselect() {
      treeselect().then((response) => {
        this.deptOptions = response.data;
      });
    },
    // Nút sàng lọc
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // Sự kiện nhấp vào nút
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.handleQuery();
    },
    // Trạng tháiSửa
    handleStatusChange(row) {
      let text = row.status === "0" ? "Mở ra" : "Dừng lại";
      this.$modal
        .confirm('Xác nhận"' + text + '""' + row.userName + '"Người dùng?')
        .then(function () {
          return changeUserStatus(row.userId, row.status);
        })
        .then(() => {
          this.$modal.msgSuccess(text + "thành công");
        })
        .catch(function () {
          row.status = row.status === "0" ? "1" : "0";
        });
    },
    // Nút hủy
    cancel() {
      this.open = false;
      this.reset();
    },
    // Mẫu đơn Làm mới
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phonenumber: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
      };
      this.resetForm("form");
    },
    /** Tìm Hoạt động nút */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Làm mới Hoạt động nút */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.userId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // Trình kích hoạt hoạt động nhiều hơn
    handleCommand(command, row) {
      switch (command) {
        case "handleResetPwd":
          this.handleResetPwd(row);
          break;
        case "handleAuthRole":
          this.handleAuthRole(row);
          break;
        default:
          break;
      }
    },
    /** Thêm Hoạt động nút */
    handleAdd() {
      this.reset();
      this.getTreeselect();
      getUser().then((response) => {
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.open = true;
        this.title = "Thêm người dùng";
        this.form.password = this.initPassword;
      });
    },
    /** Sửa Hoạt động nút */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      const userId = row.userId || this.ids;
      getUser(userId).then((response) => {
        this.form = response.data;
        this.postOptions = response.posts;
        this.roleOptions = response.roles;
        this.form.postIds = response.postIds;
        this.form.roleIds = response.roleIds;
        this.open = true;
        this.title = "Sửa người dùng";
        this.form.password = "";
      });
    },
    /** Làm mới hoạt động nút mật khẩu */
    handleResetPwd(row) {
      this.$prompt('Vui lòng nhập"' + row.userName + '"Mật khẩu mới', "gợi ý", {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy bỏ",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "Độ dài của mật khẩu người dùng phải nằm trong khoảng từ 5 đến 20",
      })
        .then(({ value }) => {
          resetUserPwd(row.userId, value).then((response) => {
            this.$modal.msgSuccess("Thành công, mật khẩu mới là:" + value);
          });
        })
        .catch(() => {});
    },
    /** Chỉ định hoạt động vai trò */
    handleAuthRole: function (row) {
      const userId = row.userId;
      this.$router.push("/system/user-auth/role/" + userId);
    },
    /** Gửi nút */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.userId != undefined) {
            updateUser(this.form).then((response) => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then((response) => {
              this.$modal.msgSuccess("Thêm thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** Xoá Hoạt động nút */
    handleDelete(row) {
      const userIds = row.userId || this.ids;
      this.$modal
        .confirm('Có xác nhận số người dùng Xoá hay không"' + userIds + '"Mục dữ liệu?')
        .then(function () {
          return delUser(userIds);
        })
        .then(() => {
          this.getList();
          this.$modal.msgSuccess("Xoá thành công");
        })
        .catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download(
        "system/user/export",
        {
          ...this.queryParams,
        },
        `user_${new Date().getTime()}.xlsx`
      );
    },
    /** Nhập Excel Hoạt động nút */
    handleImport() {
      this.upload.title = "Người dùng Nhập Excel";
      this.upload.open = true;
    },
    /** Tải xuống hoạt động mẫu */
    importTemplate() {
      this.download(
        "system/user/importTemplate",
        {},
        `user_template_${new Date().getTime()}.xlsx`
      );
    },
    // Tải lên tệp xử lý
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // Tải lên tệp xử lý thành công
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(
        "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" +
          response.msg +
          "</div>",
        "Nhập Excel kết quả",
        { dangerouslyUseHTMLString: true }
      );
      this.getList();
    },
    // Gửi tệp tải lên
    submitFileForm() {
      this.$refs.upload.submit();
    },
  },
};
</script>