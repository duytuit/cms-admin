<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="Địa chỉ đăng nhập" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="Vui lòng nhập địa chỉ đăng nhập"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="tên tài khoản" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="Vui lòng nhập tên tài khoản"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">Tìm</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">Làm mới</el-button>
      </el-form-item>

    </el-form>
    <el-table
      v-loading="loading"
      :data="list.slice((pageNum-1)*pageSize,pageNum*pageSize)"
      style="width: 100%;"
    >
      <el-table-column label="Số seri" type="index" align="center">
        <template slot-scope="scope">
          <span>{{(pageNum - 1) * pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column label="Số phiên" align="center" prop="tokenId" :show-overflow-tooltip="true" />
      <el-table-column label="Tên đăng nhập" align="center" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="Tên bộ phận" align="center" prop="deptName" />
      <el-table-column label="Chủ nhà" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
      <el-table-column label="Đăng nhập" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
      <el-table-column label="Trình duyệt" align="center" prop="browser" />
      <el-table-column label="hệ điều hành" align="center" prop="os" />
      <el-table-column label="Đăng nhập vào thời gian" align="center" prop="loginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thao tác" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleForceLogout(scope.row)"
            v-hasPermi="['monitor:online:forceLogout']"
          >Lực lượng</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
  </div>
</template>

<script>
import { list, forceLogout } from "@/api/monitor/online";

export default {
  name: "Online",
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Tổng số
      total: 0,
      // Bảng dữ liệu
      list: [],
      pageNum: 1,
      pageSize: 10,
      // Tham số truy vấn
      queryParams: {
        ipaddr: undefined,
        userName: undefined
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
      list(this.queryParams).then(response => {
        this.list = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** Tìm Hoạt động nút */
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    /** Làm mới Hoạt động nút */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** Hoạt động nút rút lui mạnh mẽ */
    handleForceLogout(row) {
      this.$modal.confirm('Có xác nhận tên rút lui mạnh mẽ là"' + row.userName + '"Người dùng?').then(function() {
        return forceLogout(row.tokenId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Nghỉ hưu mạnh mẽ");
      }).catch(() => {});
    }
  }
};
</script>

