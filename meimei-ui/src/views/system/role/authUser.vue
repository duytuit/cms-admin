<template>
  <div class="app-container">
     <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="tên tài khoản" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入tên tài khoản"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="SĐT" prop="phonenumber">
        <el-input
          v-model="queryParams.phonenumber"
          placeholder="请输入SĐT"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
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
          @click="openSelectUser"
          v-hasPermi="['system:role:add']"
        >Thêm người dùng</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-circle-close"
          size="mini"
          :disabled="multiple"
          @click="cancelAuthUserAll"
          v-hasPermi="['system:role:remove']"
        >Ủy quyền hủy bỏ</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-close"
          size="mini"
          @click="handleClose"
        >Khép kín</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="tên tài khoản" prop="userName" :show-overflow-tooltip="true" />
      <el-table-column label="Biệt danh" prop="nickName" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="手机" prop="phonenumber" :show-overflow-tooltip="true" />
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-circle-close"
            @click="cancelAuthUser(scope.row)"
            v-hasPermi="['system:role:remove']"
          >Hủy ủy quyền</el-button>
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
    <select-user ref="select" :roleId="queryParams.roleId" @ok="handleQuery" />
  </div>
</template>

<script>
import { allocatedUserList, authUserCancel, authUserCancelAll } from "@/api/system/role";
import selectUser from "./selectUser";

export default {
  name: "AuthUser",
  dicts: ['sys_normal_disable'],
  components: { selectUser },
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Chọn nhóm người dùng
      userIds: [],
      // Không vô hiệu hóa
      multiple: true,
      // Tìm kiếm điều kiện, tình trạng, trạng thái
      showSearch: true,
      // Tổng số
      total: 0,
      // Dữ liệu bảng người dùng
      userList: [],
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
        phonenumber: undefined
      }
    };
  },
  created() {
    const roleId = this.$route.params && this.$route.params.roleId;
    if (roleId) {
      this.queryParams.roleId = roleId;
      this.getList();
    }
  },
  methods: {
    /** Danh sách truy vấn của người dùng được ủy quyền */
    getList() {
      this.loading = true;
      allocatedUserList(this.queryParams).then(response => {
          this.userList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // Nút trả lại
    handleClose() {
      const obj = { path: "/system/role" };
      this.$tab.closeOpenPage(obj);
    },
    /** Tìm Hoạt động nút */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Làm mới Hoạt động nút */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.userIds = selection.map(item => item.userId)
      this.multiple = !selection.length
    },
    /** Mở cửa sổ pop -up bảng người dùng được ủy quyền */
    openSelectUser() {
      this.$refs.select.show();
    },
    /** Hủy bỏ hoạt động nút ủy quyền */
    cancelAuthUser(row) {
      const roleId = this.queryParams.roleId;
      this.$modal.confirm('Xác nhận rằng bạn muốn hủy người dùng"' + row.userName + '"Vai trò?').then(function() {
        return authUserCancel({ userId: row.userId, roleId: roleId });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Hủy thẩm quyền");
      }).catch(() => {});
    },
    /** Hủy bỏ hàng loạt hoạt động của nút ủy quyền */
    cancelAuthUserAll(row) {
      const roleId = this.queryParams.roleId;
      const userIds = this.userIds.join(",");
      this.$modal.confirm('Bạn có hủy mục dữ liệu được ủy quyền của người dùng đã chọn không?').then(function() {
        return authUserCancelAll({ roleId: roleId, userIds: userIds });
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Hủy thẩm quyền");
      }).catch(() => {});
    }
  }
};
</script>