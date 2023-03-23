<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Địa chỉ đăng nhập" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="Vui lòng nhập địa chỉ đăng nhập"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="tên tài khoản" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="Vui lòng nhập tên tài khoản"
          clearable
          style="width: 240px;"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="Đăng nhập Trạng thái"
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
      <el-form-item label="Đăng nhập vào thời gian">
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
          v-hasPermi="['monitor:logininfor:remove']"
        >Xoá nhiều</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['monitor:logininfor:remove']"
        >Xóa</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['monitor:logininfor:export']"
        >Xuất Excel</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tables" v-loading="loading" :data="list" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Số truy cập" align="center" prop="infoId" />
      <el-table-column label="tên tài khoản" align="center" prop="userName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
      <el-table-column label="Địa chỉ đăng nhập" align="center" prop="ipaddr" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="Đăng nhập" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="Trình duyệt" align="center" prop="browser" :show-overflow-tooltip="true" />
      <el-table-column label="hệ điều hành" align="center" prop="os" />
      <el-table-column label="Đăng nhập Trạng thái" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="Thông tin vận hành" align="center" prop="msg" />
      <el-table-column label="Ngày đăng nhập" align="center" prop="loginTime" sortable="custom" :sort-orders="['descending', 'ascending']" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
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
  </div>
</template>

<script>
import { list, delLogininfor, cleanLogininfor } from "@/api/monitor/logininfor";

export default {
  name: "Logininfor",
  dicts: ['sys_common_status'],
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
      // Ngày tháng
      dateRange: [],
      // mặc định phân loại
      defaultSort: {prop: 'loginTime', order: 'descending'},
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        ipaddr: undefined,
        userName: undefined,
        status: undefined
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** Danh sách nhật ký đăng nhập truy vấn */
    getList() {
      this.loading = true;
      list(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.list = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
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
      this.ids = selection.map(item => item.infoId)
      this.multiple = !selection.length
    },
    /** Sắp xếp sự kiện kích hoạt */
    handleSortChange(column, prop, order) {
      this.queryParams.orderByColumn = column.prop;
      this.queryParams.isAsc = column.order;
      this.getList();
    },
    /** Xoá Hoạt động nút */
    handleDelete(row) {
      const infoIds = row.infoId || this.ids;
      this.$modal.confirm('Có xác nhận không Xoá Số truy cập là"' + infoIds + '"Mục dữ liệu?').then(function() {
        return delLogininfor(infoIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    },
    /** Xóa hoạt động */
    handleClean() {
      this.$modal.confirm('Bạn có xác nhận tất cả các mục dữ liệu nhật ký đăng nhập không?').then(function() {
        return cleanLogininfor();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Thành công");
      }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('monitor/logininfor/export', {
        ...this.queryParams
      }, `logininfor_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>

