<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Mô -đun hệ thống" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="Vui lòng nhập mô -đun hệ thống"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="nhà điều hành" prop="operName">
        <el-input
          v-model="queryParams.operName"
          placeholder="Vui lòng nhập nhà điều hành"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Các loại" prop="businessType">
        <el-select
          v-model="queryParams.businessType"
          placeholder="Loại hoạt động"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_oper_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Trạng thái"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_common_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Thời gian hoạt động">
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
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['monitor:operlog:remove']"
        >Xoá nhiều</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['monitor:operlog:remove']"
        >Xóa</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['monitor:operlog:export']"
        >Xuất Excel</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Số nhật ký" align="center" prop="operId" />
      <el-table-column label="Mô -đun hệ thống" align="center" prop="title" />
      <el-table-column label="Loại hoạt động" align="center" prop="businessType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_oper_type" :value="scope.row.businessType"/>
        </template>
      </el-table-column>
      <el-table-column label="Cách yêu cầu" align="center" prop="requestMethod" />
      <el-table-column label="nhà điều hành" align="center" prop="operName" width="100" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="Địa chỉ hoạt động" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="Nơi" align="center" prop="operLocation" :show-overflow-tooltip="true" />
      <el-table-column label="Trạng thái" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="Ngày hoạt động" align="center" prop="operTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.operTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thao tác" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row,scope.index)"
            v-hasPermi="['monitor:operlog:query']"
          >chi tiết</el-button>
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

    <!-- Nhật ký hoạt động chi tiết -->
    <el-dialog title="Nhật ký hoạt động chi tiết" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Mô -đun hoạt động:">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
            <el-form-item
              label="đăng nhập thông tin:"
            >{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Địa chỉ yêu cầu:">{{ form.operUrl }}</el-form-item>
            <el-form-item label="Phương pháp yêu cầu:">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Phương pháp hoạt động:">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Thông số yêu cầu:">{{ form.operParam }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Quay lại tham số:">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái：">
              <div v-if="form.status === 0">thông thường</div>
              <div v-else-if="form.status === 1">Thất bại</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Thời gian hoạt động:">{{ parseTime(form.operTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Thông tin bất thường:" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">Đóng</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, delOperlog, cleanOperlog } from "@/api/monitor/operlog";

export default {
  name: "Operlog",
  dicts: ['sys_oper_type', 'sys_common_status'],
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Chọn mảng
      ids: [],
      // Không vô hiệu hóa
      multiple: true,
      // Tìm kiếm điều kiện, tình trạng, trạng thái
      showSearch: true,
      // Tổng số
      total: 0,
      // Bảng dữ liệu
      list: [],
      // Có hiển thị lớp pop -up
      open: false,
      // Ngày tháng
      dateRange: [],
      // mặc định phân loại
      defaultSort: {prop: 'operTime', order: 'descending'},
      // Biểu mẫu tham số
      form: {},
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: undefined,
        operName: undefined,
        businessType: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** Nhật ký đăng nhập truy vấn */
    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then( response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // Hoạt động bản dịch từ điển loại nhật ký
    typeFormat(row, column) {
      return this.selectDictLabel(this.dict.type.sys_oper_type, row.businessType);
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
      this.$refs.tables.sort(this.defaultSort.prop, this.defaultSort.order)
      this.handleQuery();
    },
    /** Dữ liệu lựa chọn hộp đa chương trình */
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.operId)
      this.multiple = !selection.length
    },
    /** Sắp xếp sự kiện kích hoạt */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** Hoạt động nút chi tiết */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** Xoá Hoạt động nút */
    handleDelete(row) {
      const operIds = row.operId || this.ids;
      this.$modal.confirm('Có xác nhận không Xoá Số nhật ký là"' + operIds + '"Mục dữ liệu?').then(function() {
        return delOperlog(operIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    },
    /** Xóa hoạt động */
    handleClean() {
      this.$modal.confirm('Bạn có xác nhận tất cả các mục dữ liệu của tất cả các nhật ký hoạt động không?').then(function() {
        return cleanOperlog();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Thành công");
      }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('monitor/operlog/export', {
        ...this.queryParams
      }, `operlog_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

