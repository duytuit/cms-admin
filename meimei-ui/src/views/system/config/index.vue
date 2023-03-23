<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Tên tham số" prop="configName">
        <el-input
          v-model="queryParams.configName"
          placeholder="Vui lòng nhập tên tham số"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên khóa tham số" prop="configKey">
        <el-input
          v-model="queryParams.configKey"
          placeholder="Vui lòng nhập tên khóa tham số"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Hệ thống xây dựng -in" prop="configType">
        <el-select v-model="queryParams.configType" placeholder="Hệ thống xây dựng -in" clearable>
          <el-option
            v-for="dict in dict.type.sys_yes_no"
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
          v-hasPermi="['system:config:add']"
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
          v-hasPermi="['system:config:edit']"
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
          v-hasPermi="['system:config:remove']"
        >Xoá</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:config:export']"
        >Xuất Excel</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-refresh"
          size="mini"
          @click="handleRefreshCache"
          v-hasPermi="['system:config:remove']"
        >Làm mới Bộ nhớ cache</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Phím tham số" align="center" prop="configId" />
      <el-table-column label="Tên tham số" align="center" prop="configName" :show-overflow-tooltip="true" />
      <el-table-column label="Tên khóa tham số" align="center" prop="configKey" :show-overflow-tooltip="true" />
      <el-table-column label="Giá trị khóa tham số" align="center" prop="configValue" />
      <el-table-column label="Hệ thống xây dựng -in" align="center" prop="configType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.configType"/>
        </template>
      </el-table-column>
      <el-table-column label="Nhận xét" align="center" prop="remark" :show-overflow-tooltip="true" />
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
            v-hasPermi="['system:config:edit']"
          >Sửa</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:config:remove']"
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

    <!-- Thêm hoặc Sửa Hộp thoại cấu hình tham số -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Tên tham số" prop="configName">
          <el-input v-model="form.configName" placeholder="Vui lòng nhập tên tham số" />
        </el-form-item>
        <el-form-item label="Tên khóa tham số" prop="configKey">
          <el-input v-model="form.configKey" placeholder="Vui lòng nhập tên khóa tham số" />
        </el-form-item>
        <el-form-item label="Giá trị khóa tham số" prop="configValue">
          <el-input v-model="form.configValue" placeholder="Vui lòng nhập giá trị khóa tham số" />
        </el-form-item>
        <el-form-item label="Hệ thống xây dựng -in" prop="configType">
          <el-radio-group v-model="form.configType">
            <el-radio
              v-for="dict in dict.type.sys_yes_no"
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
import { listConfig, getConfig, delConfig, addConfig, updateConfig, refreshCache } from "@/api/system/config";

export default {
  name: "Config",
  dicts: ['sys_yes_no'],
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
      // Dữ liệu bảng tham số
      configList: [],
      // Tiêu đề lớp pop -up
      title: "",
      // Có hiển thị lớp pop -up
      open: false,
      // Ngày tháng
      dateRange: [],
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        configName: undefined,
        configKey: undefined,
        configType: undefined
      },
      // Biểu mẫu tham số
      form: {},
      // Hình thức xác minh
      rules: {
        configName: [
          { required: true, message: "Tên tham số không thể trống", trigger: "blur" }
        ],
        configKey: [
          { required: true, message: "Tên khóa tham số không thể trống", trigger: "blur" }
        ],
        configValue: [
          { required: true, message: "Giá trị khóa tham số không thể trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** Danh sách tham số truy vấn */
    getList() {
      this.loading = true;
      listConfig(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.configList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // Nút hủy
    cancel() {
      this.open = false;
      this.reset();
    },
    // Mẫu đơn Làm mới
    reset() {
      this.form = {
        configId: undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined,
        configType: "Y",
        remark: undefined
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
    /** Thêm Hoạt động nút */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm tham số";
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.configId)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** Sửa Hoạt động nút */
    handleUpdate(row) {
      this.reset();
      const configId = row.configId || this.ids
      getConfig(configId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Sửa tham số";
      });
    },
    /** Gửi nút */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.configId != undefined) {
            updateConfig(this.form).then(response => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addConfig(this.form).then(response => {
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
      const configIds = row.configId || this.ids;
      this.$modal.confirm('Có xác nhận không Xoá Số tham số là"' + configIds + '"Mục dữ liệu?').then(function() {
          return delConfig(configIds);
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("Xoá thành công");
        }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('system/config/export', {
        ...this.queryParams
      }, `config_${new Date().getTime()}.xlsx`)
    },
    /** Làm mới Hoạt động nút bộ đệm */
    handleRefreshCache() {
      refreshCache().then(() => {
        this.$modal.msgSuccess("Làm mới thành công");
      });
    }
  }
};
</script>
