<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Tên nhiệm vụ" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="Vui lòng nhập tên tác vụ"
          clearable
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên nhóm nhiệm vụ" prop="jobGroup">
        <el-select
          v-model="queryParams.jobGroup"
          placeholder="Vui lòng chọn tên nhóm tác vụ"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="dict in dict.type.sys_job_group"
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
      <el-form-item label="thời gian thực hiện">
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
          v-hasPermi="['monitor:job:remove']"
        >Xoá</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          @click="handleClean"
          v-hasPermi="['monitor:job:remove']"
        >Trống rỗng</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['monitor:job:export']"
        >Xuất Excel</el-button>
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

    <el-table v-loading="loading" :data="jobLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Số nhật ký" width="80" align="center" prop="jobLogId" />
      <el-table-column label="Tên nhiệm vụ" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="Tên nhóm nhiệm vụ" align="center" prop="jobGroup" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_job_group" :value="scope.row.jobGroup"/>
        </template>
      </el-table-column>
      <el-table-column label="Gọi chuỗi đích" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="Thông tin đăng nhập" align="center" prop="jobMessage" :show-overflow-tooltip="true" />
      <el-table-column label="Trạng thái" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="thời gian thực hiện" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Thao tác" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['monitor:job:query']"
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

    <!-- Nhật ký kỷ luật chi tiết -->
    <el-dialog title="Nhật ký kỷ luật chi tiết" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Số sê -ri đăng nhập:">{{ form.jobLogId }}</el-form-item>
            <el-form-item label="Tên nhiệm vụ:">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhóm nhiệm vụ:">{{ form.jobGroup }}</el-form-item>
            <el-form-item label="thời gian thực hiện:">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Phương pháp gọi:">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Thông tin nhật ký:">{{ form.jobMessage }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Trạng thái：">
              <div v-if="form.status == 0">thông thường</div>
              <div v-else-if="form.status == 1">Thất bại</div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Thông tin bất thường:" v-if="form.status == 1">{{ form.exceptionInfo }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">Khép kín</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getJob} from "@/api/monitor/job";
import { listJobLog, delJobLog, cleanJobLog } from "@/api/monitor/jobLog";

export default {
  name: "JobLog",
  dicts: ['sys_common_status', 'sys_job_group'],
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
      // Lịch trình dữ liệu mẫu nhật ký
      jobLogList: [],
      // Có hiển thị lớp pop -up
      open: false,
      // Ngày tháng
      dateRange: [],
      // Biểu mẫu tham số
      form: {},
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      }
    };
  },
  created() {
    const jobId = this.$route.query.jobId;
    if (jobId !== undefined && jobId != 0) {
      getJob(jobId).then(response => {
        this.queryParams.jobName = response.data.jobName;
        this.queryParams.jobGroup = response.data.jobGroup;
        this.getList();
      });
    } else {
      this.getList();
    }
  },
  methods: {
    /** Danh sách nhật ký lập lịch truy vấn */
    getList() {
      this.loading = true;
      listJobLog(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.jobLogList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    // Nút trả lại
    handleClose() {
      const obj = { path: "/monitor/job" };
      this.$tab.closeOpenPage(obj);
    },
    /** Hoạt động nút tìm */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Làm Hoạt động nút MớI */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.jobLogId);
      this.multiple = !selection.length;
    },
    /** Hoạt động nút chi tiết */
    handleView(row) {
      this.open = true;
      this.form = row;
    },
    /** Hoạt động nút Xoá */
    handleDelete(row) {
      const jobLogIds = this.ids;
      this.$modal.confirm('Có xác nhận số nhật ký lập lịch XOá không"' + jobLogIds + '"Mục dữ liệu?').then(function() {
        return delJobLog(jobLogIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    },
    /** Xóa hoạt động */
    handleClean() {
      this.$modal.confirm('Bạn có xác nhận tất cả các mục dữ liệu nhật ký lập lịch không?').then(function() {
        return cleanJobLog();
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Thành công");
      }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('/monitor/jobLog/export', {
        ...this.queryParams
      }, `log_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
