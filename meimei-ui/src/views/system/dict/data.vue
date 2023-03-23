<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Tên từ điển" prop="dictType">
        <el-select v-model="queryParams.dictType">
          <el-option
            v-for="item in typeOptions"
            :key="item.dictId"
            :label="item.dictName"
            :value="item.dictType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Nhãn từ điển" prop="dictLabel">
        <el-input
          v-model="queryParams.dictLabel"
          placeholder="Vui lòng nhập nhãn từ điển"
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
          v-hasPermi="['system:dict:add']"
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
          v-hasPermi="['system:dict:edit']"
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
          v-hasPermi="['system:dict:remove']"
        >Xoá</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:dict:export']"
        >Xuất Excel</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-close"
          size="mini"
          @click="handleClose"
        >Đóng</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Từ điển" align="center" prop="dictCode" />
      <el-table-column label="Nhãn từ điển" align="center" prop="dictLabel">
        <template slot-scope="scope">
          <span v-if="scope.row.listClass == '' || scope.row.listClass == 'default'">{{scope.row.dictLabel}}</span>
          <el-tag v-else :type="scope.row.listClass == 'primary' ? '' : scope.row.listClass">{{scope.row.dictLabel}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Giá trị khóa từ điển" align="center" prop="dictValue" />
      <el-table-column label="Từ điển" align="center" prop="dictSort" />
      <el-table-column label="Trạng thái" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
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
            v-hasPermi="['system:dict:edit']"
          >Sửa</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:dict:remove']"
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

    <!-- Thêm hoặc hộp thoại cấu hình tham số Sửa -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Từ điển">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="Nhãn dữ liệu" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="Vui lòng nhập thẻ dữ liệu" />
        </el-form-item>
        <el-form-item label="Khóa dữ liệu" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="Vui lòng nhập giá trị khóa dữ liệu" />
        </el-form-item>
        <el-form-item label="Thuộc tính phong cách" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="Vui lòng nhập thuộc tính kiểu" />
        </el-form-item>
        <el-form-item label="Hiển thị phân loại" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="Phong cách trở lại" prop="listClass">
          <el-select v-model="form.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
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
          <el-input v-model="form.remark" type="textarea" placeholder="Vui lòng nhập nội dung"></el-input>
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
import { listData, getData, delData, addData, updateData } from "@/api/system/dict/data";
import { listType, getType } from "@/api/system/dict/type";

export default {
  name: "Data",
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
      // Dữ liệu bảng từ điển
      dataList: [],
      // Loại từ điển mặc định
      defaultDictType: "",
      // Tiêu đề lớp pop -up
      title: "",
      // Có hiển thị lớp pop -up
      open: false,
      // Nhãn dữ liệu trở lại kiểu hiển thị
      listClassOptions: [
        {
          value: "default",
          label: "mặc định"
        },
        {
          value: "primary",
          label: "chủ yếu"
        },
        {
          value: "success",
          label: "thành công"
        },
        {
          value: "info",
          label: "thông tin"
        },
        {
          value: "warning",
          label: "cảnh báo"
        },
        {
          value: "danger",
          label: "Sự nguy hiểm"
        }
      ],
      // Loại từ điển dữ liệu
      typeOptions: [],
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      // Biểu mẫu tham số
      form: {},
      // Hình thức xác minh
      rules: {
        dictLabel: [
          { required: true, message: "Thẻ dữ liệu không thể trống", trigger: "blur" }
        ],
        dictValue: [
          { required: true, message: "Giá trị khóa dữ liệu không thể trống", trigger: "blur" }
        ],
        dictSort: [
          { required: true, message: "Đơn hàng dữ liệu không thể trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    const dictId = this.$route.params && this.$route.params.dictId;
    this.getType(dictId);
    this.getTypeList();
  },
  methods: {
    /** Loại từ điển truy vấn chi tiết */
    getType(dictId) {
      getType(dictId).then(response => {
        this.queryParams.dictType = response.data.dictType;
        this.defaultDictType = response.data.dictType;
        this.getList();
      });
    },
    /** Danh sách loại từ điển truy vấn */
    getTypeList() {
      listType().then(response => {
        this.typeOptions = response.rows;
      });
    },
    /** Danh sách dữ liệu từ điển truy vấn */
    getList() {
      this.loading = true;
      listData(this.queryParams).then(response => {
        this.dataList = response.rows;
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
        dictCode: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        cssClass: undefined,
        listClass: 'default',
        dictSort: 0,
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
    /** Hoạt động trở lại nút */
    handleClose() {
      const obj = { path: "/system/dict" };
      this.$tab.closeOpenPage(obj);
    },
    /** Làm Hoạt động nút MớI */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },
    /** Thao tác nút */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm dữ liệu từ điển";
      this.form.dictType = this.queryParams.dictType;
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dictCode)
      this.single = selection.length!=1
      this.multiple = !selection.length
    },
    /** Hoạt động nút Sửa */
    handleUpdate(row) {
      this.reset();
      const dictCode = row.dictCode || this.ids
      getData(dictCode).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Dữ liệu từ điển Sửa";
      });
    },
    /** Gửi nút */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dictCode != undefined) {
            updateData(this.form).then(response => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addData(this.form).then(response => {
              this.$modal.msgSuccess("Thêm mới thành công");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** Hoạt động nút Xoá */
    handleDelete(row) {
      const dictCodes = row.dictCode || this.ids;
      this.$modal.confirm('Có xác nhận mã hóa từ điển xoá là"' + dictCodes + '"Mục dữ liệu?').then(function() {
        return delData(dictCodes);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('system/dict/data/export', {
        ...this.queryParams
      }, `data_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>