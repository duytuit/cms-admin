<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Mã bài viết" prop="postCode">
        <el-input
          v-model="queryParams.postCode"
          placeholder="Vui lòng nhập mã hóa bài đăng"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên vị trí" prop="postName">
        <el-input
          v-model="queryParams.postName"
          placeholder="Vui lòng nhập tên bài viết"
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
          v-hasPermi="['system:post:add']"
        >Thêm</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:post:edit']"
        >Sửa</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:post:remove']"
        >Xoá</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:post:export']"
        >Xuất Excel</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Số công việc" align="center" prop="postId" />
      <el-table-column label="Mã bài viết" align="center" prop="postCode" />
      <el-table-column label="Tên vị trí" align="center" prop="postName" />
      <el-table-column label="Sắp xếp vị trí" align="center" prop="postSort" />
      <el-table-column label="Trạng thái" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="Thời gian" align="center" prop="createTime" width="180">
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
            v-hasPermi="['system:post:edit']"
          >Sửa</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:post:remove']"
          >Xoá</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- Thêm hoặc sửa hộp thoại -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Tên vị trí" prop="postName">
          <el-input v-model="form.postName" placeholder="Vui lòng nhập tên bài viết" />
        </el-form-item>
        <el-form-item label="Mã bài viết" prop="postCode">
          <el-input v-model="form.postCode" placeholder="Vui lòng nhập tên mã hóa" />
        </el-form-item>
        <el-form-item label="Đặt hàng đặt hàng" prop="postSort">
          <el-input-number v-model="form.postSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Trạng thái" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Nhận xét" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Vui lòng nhập nội dung" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">Lưu lại</el-button>
        <el-button @click="cancel">Huỷ</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPost, getPost, delPost, addPost, updatePost } from "@/api/system/post";

export default {
  name: "Post",
  dicts: ['sys_normal_disable'],
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
      // Dữ liệu biểu mẫu công việc
      postList: [],
      // Tiêu đề lớp pop -up
      title: "",
      // Có hiển thị lớp pop -up
      open: false,
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        postCode: undefined,
        postName: undefined,
        status: undefined
      },
      // Biểu mẫu tham số
      form: {},
      // Hình thức xác minh
      rules: {
        postName: [
          { required: true, message: "Tên công việc không thể trống", trigger: "blur" }
        ],
        postCode: [
          { required: true, message: "Mã hóa công việc không thể trống", trigger: "blur" }
        ],
        postSort: [
          { required: true, message: "Đơn hàng không thể trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** Danh sách bài truy vấn */
    getList() {
      this.loading = true;
      listPost(this.queryParams).then(response => {
        this.postList = response.rows;
        this.total = response.total;
        this.loading = false;
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
        postId: undefined,
        postCode: undefined,
        postName: undefined,
        postSort: 0,
        status: "0",
        remark: undefined
      };
      this.resetForm("form");
    },
    /** Hoạt động nút tìm */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Làm Hoạt động nút MớI */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.postId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** Thêm Hoạt động nút */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Bưu kiện";
    },
    /** Sửa Hoạt động nút */
    handleUpdate(row) {
      this.reset();
      const postId = row.postId || this.ids
      getPost(postId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa bưu kiện";
      });
    },
    /** Gửi nút */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.postId != undefined) {
            updatePost(this.form).then(response => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addPost(this.form).then(response => {
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
      const postIds = row.postId || this.ids;
      this.$modal.confirm('Có xác nhận số vị trí Xoá là"' + postIds + '"Mục dữ liệu?').then(function() {
        return delPost(postIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('system/post/export', {
        ...this.queryParams
      }, `post_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
