<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Tên nhiệm vụ" prop="jobName">
        <el-input
          v-model="queryParams.jobName"
          placeholder="Vui lòng nhập tên tác vụ"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Tên nhóm nhiệm vụ" prop="jobGroup">
        <el-select v-model="queryParams.jobGroup" placeholder="Vui lòng chọn tên nhóm tác vụ" clearable>
          <el-option
            v-for="dict in dict.type.sys_job_group"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Trạng thái" prop="status">
        <el-select v-model="queryParams.status" placeholder="Trạng thái" clearable>
          <el-option
            v-for="dict in dict.type.sys_job_status"
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
          v-hasPermi="['monitor:job:add']"
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
          v-hasPermi="['monitor:job:edit']"
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
          v-hasPermi="['monitor:job:remove']"
        >Xoá</el-button>
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
          type="info"
          plain
          icon="el-icon-s-operation"
          size="mini"
          @click="handleJobLog"
          v-hasPermi="['monitor:job:query']"
        >Đăng nhập</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="Số nhiệm vụ" width="100" align="center" prop="jobId" />
      <el-table-column label="Tên nhiệm vụ" align="center" prop="jobName" :show-overflow-tooltip="true" />
      <el-table-column label="Tên nhóm nhiệm vụ" align="center" prop="jobGroup">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_job_group" :value="scope.row.jobGroup"/>
        </template>
      </el-table-column>
      <el-table-column label="Gọi chuỗi đích" align="center" prop="invokeTarget" :show-overflow-tooltip="true" />
      <el-table-column label="cron Thể hiện" align="center" prop="cronExpression" :show-overflow-tooltip="true" />
      <el-table-column label="Trạng thái" align="center">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="Thao tác" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['monitor:job:edit']"
          >Sửa</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['monitor:job:remove']"
          >Xoá</el-button>
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['monitor:job:changeStatus', 'monitor:job:query']">
            <span class="el-dropdown-link">
              <i class="el-icon-d-arrow-right el-icon--right"></i>Hơn
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="handleRun" icon="el-icon-caret-right"
                v-hasPermi="['monitor:job:changeStatus']">Hành hình</el-dropdown-item>
              <el-dropdown-item command="handleView" icon="el-icon-view"
                v-hasPermi="['monitor:job:query']">Nhiệm vụ chi tiết</el-dropdown-item>
              <el-dropdown-item command="handleJobLog" icon="el-icon-s-operation"
                v-hasPermi="['monitor:job:query']">Xác định nhật ký</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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

    <!-- Thêm hoặc sửa hộp thoại nhiệm vụ thời gian -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Tên nhiệm vụ" prop="jobName">
              <el-input v-model="form.jobName" placeholder="Vui lòng nhập tên tác vụ" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhóm nhiệm vụ" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="Vui lòng chọn nhóm tác vụ">
                <el-option
                  v-for="dict in dict.type.sys_job_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <span slot="label">
                Phương thức gọi
                <el-tooltip placement="top">
                  <div slot="content">
                    Bean Gọi ví dụ ：JobService.ceshi(1,2,3,true)
                    <br />Tham số Mô tả: Chuỗi hỗ trợ, Loại Boolean, Giá trị
                  </div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input v-model="form.invokeTarget" placeholder="Vui lòng nhập chuỗi mục tiêu cuộc gọi" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron sự biểu lộ" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="Vui lòng nhập cron Thể hiện">
                <template slot="append">
                  <el-button type="primary" @click="handleShowCron">
                    Tạo biểu thức
                    <i class="el-icon-time el-icon--right"></i>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Chiến lược điều hành" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy" size="small">
                <el-radio-button label="1">Thực thi ngay lập tức</el-radio-button>
                <el-radio-button label="2">Hành hình</el-radio-button>
                <el-radio-button label="3">Từ bỏ thực thi</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_job_status"
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

    <el-dialog title="Cron Trình tạo biểu thức" :visible.sync="openCron" append-to-body destroy-on-close class="scrollbar">
      <crontab @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
    </el-dialog>

    <!-- Nhật ký nhiệm vụ chi tiết -->
    <el-dialog title="Nhiệm vụ chi tiết" :visible.sync="openView" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="120px" size="mini">
        <el-row>
          <el-col :span="12">
            <el-form-item label="Số nhiệm vụ:">{{ form.jobId }}</el-form-item>
            <el-form-item label="Tên nhiệm vụ:">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhóm nhiệm vụ:">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="Thời gian：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron sự biểu lộ:">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Thời gian thực hiện tiếp theo:">{{ parseTime(form.nextValidTime) }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Gọi phương thức đích:">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Trạng thái：">
              <div v-if="form.status == 0">thông thường</div>
              <div v-else-if="form.status == 1">Thất bại</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Chiến lược điều hành:">
              <div v-if="form.misfirePolicy == 0">Chiến lược mặc địnhn lược mặc định</div>
              <div v-else-if="form.misfirePolicy == 1">Thực thi ngay lập tức</div>
              <div v-else-if="form.misfirePolicy == 2">Hành hình</div>
              <div v-else-if="form.misfirePolicy == 3">Từ bỏ thực thi</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="openView = false">Khép kín</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listJob, getJob, delJob, addJob, updateJob, runJob, changeJobStatus } from "@/api/monitor/job";
import Crontab from '@/components/Crontab'

export default {
  components: { Crontab },
  name: "Job",
  dicts: ['sys_job_group', 'sys_job_status'],
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
      // Dữ liệu biểu mẫu nhiệm vụ thời gian
      jobList: [],
      // Tiêu đề lớp pop -up
      title: "",
      // Có hiển thị lớp pop -up
      open: false,
      // Có hiển thị lớp pop -up chi tiết
      openView: false,
      // Có hiển thị không Cron Lớp pop -up biểu thức
      openCron: false,
      // Biểu thức đầu vào
      expression: "",
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        jobName: undefined,
        jobGroup: undefined,
        status: undefined
      },
      // Biểu mẫu tham số
      form: {},
      // Định dạng
      rules: {
        jobName: [
          { required: true, message: "Tên tác vụ không thể trống", trigger: "blur" }
        ],
        invokeTarget: [
          { required: true, message: "Gọi chuỗi đích không thể trống", trigger: "blur" }
        ],
        cronExpression: [
          { required: true, message: "cron Biểu diễn biểu thức không thể trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** Danh sách nhiệm vụ thời gian truy vấn */
    getList() {
      this.loading = true;
      listJob(this.queryParams).then(response => {
        this.jobList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // Bản dịch ciles nhóm tác vụ
    jobGroupFormat(row, column) {
      return this.selectDictLabel(this.dict.type.sys_job_group, row.jobGroup);
    },
    // Nút hủy
    cancel() {
      this.open = false;
      this.reset();
    },
    // Mẫu đơn Làm mới
    reset() {
      this.form = {
        jobId: undefined,
        jobName: undefined,
        jobGroup: undefined,
        invokeTarget: undefined,
        cronExpression: undefined,
        misfirePolicy: 1,
        concurrent: 1,
        status: "0"
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
      this.ids = selection.map(item => item.jobId);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    // Trình kích hoạt hoạt động nhiều hơn
    handleCommand(command, row) {
      switch (command) {
        case "handleRun":
          this.handleRun(row);
          break;
        case "handleView":
          this.handleView(row);
          break;
        case "handleJobLog":
          this.handleJobLog(row);
          break;
        default:
          break;
      }
    },
    // Nhiệm vụ Trạng tháiSửa
    handleStatusChange(row) {
      let text = row.status === "0" ? "Mở ra" : "Dừng lại";
      this.$modal.confirm('Xác nhận"' + text + '""' + row.jobName + '"Là nhiệm vụ?').then(function() {
        return changeJobStatus(row.jobId, row.status);
      }).then(() => {
        this.$modal.msgSuccess(text + "thành công");
      }).catch(function() {
        row.status = row.status === "0" ? "1" : "0";
      });
    },
    /* Thực hiện nó một lần */
    handleRun(row) {
      this.$modal.confirm('Xác nhận rằng bạn phải thực hiện nó một lần ngay lập tức"' + row.jobName + '"Là nhiệm vụ?').then(function() {
        return runJob(row.jobId, row.jobGroup);
      }).then(() => {
        this.$modal.msgSuccess("thực thi thành công");
      }).catch(() => {});
    },
    /** Chi tiết về nhiệm vụ */
    handleView(row) {
      getJob(row.jobId).then(response => {
        this.form = response.data;
        this.openView = true;
      });
    },
    /** cron Hoạt động nút biểu thức */
    handleShowCron() {
      this.expression = this.form.cronExpression;
      this.openCron = true;
    },
    /** Giá trị sau khi xác nhận */
    crontabFill(value) {
      this.form.cronExpression = value;
    },
    /** Truy vấn danh sách nhật ký nhiệm vụ */
    handleJobLog(row) {
      const jobId = row.jobId || 0;
      this.$router.push({ path: '/monitor/job-log/index', query: { jobId: jobId } })
    },
    /** Thêm Hoạt động nút */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "Thêm nhiệm vụ";
    },
    /** Hoạt động nút Sửa */
    handleUpdate(row) {
      this.reset();
      const jobId = row.jobId || this.ids;
      getJob(jobId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Nhiệm vụ sửa";
      });
    },
    /** Gửi nút */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.jobId != undefined) {
            updateJob(this.form).then(response => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addJob(this.form).then(response => {
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
      const jobIds = row.jobId || this.ids;
      this.$modal.confirm('Có xác nhận số nhiệm vụ thời gian XOá không"' + jobIds + '"Mục dữ liệu?').then(function() {
        return delJob(jobIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    },
    /** Xuất Excel Hoạt động nút */
    handleExport() {
      this.download('monitor/job/export', {
        ...this.queryParams
      }, `job_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
