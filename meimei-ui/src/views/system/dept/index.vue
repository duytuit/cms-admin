<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="Tên bộ phận" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="Vui lòng nhập tên của bộ phận"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select v-model="queryParams.status" placeholder="Trạng thái" clearable>
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Làm mới</el-button>
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
          v-hasPermi="['system:dept:add']"
        >Thêm</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >Mở rộng/đóng</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="deptName" label="Tên bộ phận" width="260"></el-table-column>
      <el-table-column prop="orderNum" label="Loại" width="200"></el-table-column>
      <el-table-column prop="status" label="Trạng thái" width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="Thời gian" align="center" prop="createTime" width="200">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thao tác" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:dept:edit']"
          >Sửa</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:dept:add']"
          >Thêm</el-button>
          <el-button
            v-if="scope.row.parentId != 0"
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:dept:remove']"
          >Xoá</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Thêm hộp thoại hoặc SửA -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="Văn phòng cao hơn" prop="parentId">
              <treeselect v-model="form.parentId" :options="deptOptions" :normalizer="normalizer" placeholder="Chọn một bộ phận cao cấp" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Tên bộ phận" prop="deptName">
              <el-input v-model="form.deptName" placeholder="Vui lòng nhập tên của bộ phận" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Hiển thị phân loại" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="hiệu trưởng" prop="leader">
              <el-input v-model="form.leader" placeholder="Vui lòng nhập người phụ trách" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="số liên lạc" prop="phone">
              <el-input v-model="form.phone" placeholder="Vui lòng nhập số điện thoại của bạn" maxlength="11" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" placeholder="Vui lòng nhập email của bạn" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Lưu lại</el-button>
        <el-button @click="cancel">Huỷ</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDept, getDept, delDept, addDept, updateDept, listDeptExcludeChild } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Dept",
  dicts: ['sys_normal_disable'],
  components: { Treeselect },
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Tìm kiếm điều kiện, tình trạng, trạng thái
      showSearch: true,
      // Dữ liệu cây bàn
      deptList: [],
      // Tùy chọn cây của bộ phận
      deptOptions: [],
      // Tiêu đề lớp pop -up
      title: "",
      // Có hiển thị lớp pop -up
      open: false,
      // Có mở không, tất cả các mặc định mở ra
      isExpandAll: true,
      // Bảng tái tạo Trạng thái
      refreshTable: true,
      // Tham số truy vấn
      queryParams: {
        deptName: undefined,
        status: undefined
      },
      // Biểu mẫu tham số
      form: {},
      // Hình thức xác minh
      rules: {
        parentId: [
          { required: true, message: "Bộ phận cấp trên không thể trống", trigger: "blur" }
        ],
        deptName: [
          { required: true, message: "Tên bộ phận Không thể trống", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "Hiển thị phân loại không thể trống", trigger: "blur" }
        ],
        email: [
          {
            type: "email",
            message: "Vui lòng nhập đúng địa chỉ email",
            trigger: ["blur", "change"]
          }
        ],
        phone: [
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "Vui lòng nhập đúng SĐT",
            trigger: "blur"
          }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** Danh sách bộ phận truy vấn */
    getList() {
      this.loading = true;
      listDept(this.queryParams).then(response => {
        this.deptList = this.handleTree(response.data, "deptId");
        this.loading = false;
      });
    },
    /** Cấu trúc dữ liệu của bộ phận chuyển đổi */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      };
    },
    // Nút hủy
    cancel() {
      this.open = false;
      this.reset();
    },
    // Mẫu đơn Làm mới
    reset() {
      this.form = {
        deptId: undefined,
        parentId: undefined,
        deptName: undefined,
        orderNum: undefined,
        leader: undefined,
        phone: undefined,
        email: undefined,
        status: "0"
      };
      this.resetForm("form");
    },
    /** Tìm Hoạt động nút */
    handleQuery() {
      this.getList();
    },
    /** Làm mới Hoạt động nút */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** Thao tác nút */
    handleAdd(row) {
      this.reset();
      if (row != undefined) {
        this.form.parentId = row.deptId;
      }
      this.open = true;
      this.title = "Thêm bộ phận";
      listDept().then(response => {
        this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },
    /** Mở rộng/đóng chạy */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** Hoạt động nút Sửa */
    handleUpdate(row) {
      this.reset();
      getDept(row.deptId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa Phòng ban";
      });
      listDeptExcludeChild(row.deptId).then(response => {
        this.deptOptions = this.handleTree(response.data, "deptId");
      });
    },
    /** Gửi nút */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.deptId != undefined) {
            updateDept(this.form).then(response => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addDept(this.form).then(response => {
              this.$modal.msgSuccess("THÀNH VIÊN THÀNH CÔNG");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** Hoạt động nút Xoá */
    handleDelete(row) {
      this.$modal.confirm('Có xác nhận không Xoá Tên"' + row.deptName + '"Mục dữ liệu?').then(function() {
        return delDept(row.deptId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    }
  }
};
</script>
