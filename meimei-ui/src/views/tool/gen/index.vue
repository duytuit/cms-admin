<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="Tên bảng" prop="tableName">
        <el-input
          v-model="queryParams.tableName"
          placeholder="Vui lòng nhập tên bảng"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="Mô tả bảng" prop="tableComment">
        <el-input
          v-model="queryParams.tableComment"
          placeholder="Vui lòng nhập mô tả bảng"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          icon="el-icon-download"
          size="mini"
          @click="handleGenTable"
          v-hasPermi="['tool:gen:code']"
        >Tải về</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-upload"
          size="mini"
          @click="openImportTable"
          v-hasPermi="['tool:gen:import']"
        >Nhập Excel</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleEditTable"
          v-hasPermi="['tool:gen:edit']"
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
          v-hasPermi="['tool:gen:remove']"
        >Xoá</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="tableList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column label="Số seri" type="index" width="50" align="center">
        <template slot-scope="scope">
          <span>{{(queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1}}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Tên bảng"
        align="center"
        prop="tableName"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="Mô tả bảng"
        align="center"
        prop="tableComment"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column
        label="thực thể"
        align="center"
        prop="className"
        :show-overflow-tooltip="true"
        width="120"
      />
      <el-table-column label="Thời gian" align="center" prop="createTime" width="160" />
      <el-table-column label="Cập nhật thời gian" align="center" prop="updateTime" width="160" />
      <el-table-column label="Thao tác" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-view"
            @click="handlePreview(scope.row)"
            v-hasPermi="['tool:gen:preview']"
          >Xem trước</el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-edit"
            @click="handleEditTable(scope.row)"
            v-hasPermi="['tool:gen:edit']"
          >chỉnh sửa</el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['tool:gen:remove']"
          >Xoá</el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-refresh"
            @click="handleSynchDb(scope.row)"
            v-hasPermi="['tool:gen:edit']"
          >Làm cho đồng bộ</el-button>
          <el-button
            type="text"
            size="small"
            icon="el-icon-download"
            @click="handleGenTable(scope.row)"
            v-hasPermi="['tool:gen:code']"
          >Tạo mã</el-button>
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
    <!-- Giao diện xem trước -->
    <el-dialog :title="preview.title" :visible.sync="preview.open" width="80%" top="5vh" append-to-body class="scrollbar">
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/')+1,key.indexOf('.vm'))"
          :key="key"
        >
          <el-link :underline="false" icon="el-icon-document-copy" v-clipboard:copy="value" v-clipboard:success="clipboardSuccess" style="float:right">sao chép</el-link>
          <pre><code class="hljs" v-html="highlightedCode(value, key)"></code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <import-table ref="import" @ok="handleQuery" />
  </div>
</template>

<script>
import { listTable, previewTable, delTable, genCode, synchDb } from "@/api/tool/gen";
import importTable from "./importTable";
import hljs from "highlight.js/lib/highlight";
import "highlight.js/styles/github-gist.css";
hljs.registerLanguage("java", require("highlight.js/lib/languages/java"));
hljs.registerLanguage("xml", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("html", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("vue", require("highlight.js/lib/languages/xml"));
hljs.registerLanguage("javascript", require("highlight.js/lib/languages/javascript"));
hljs.registerLanguage("sql", require("highlight.js/lib/languages/sql"));

export default {
  name: "Gen",
  components: { importTable },
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Định danh duy nhất
      uniqueId: "",
      // Chọn mảng
      ids: [],
      // Chọn Mảng bảng
      tableNames: [],
      // Không vô hiệu hóa
      single: true,
      // Không vô hiệu hóa
      multiple: true,
      // Tìm kiếm điều kiện, tình trạng, trạng thái
      showSearch: true,
      // Tổng số
      total: 0,
      // Bảng dữ liệu
      tableList: [],
      // Ngày tháng
      dateRange: "",
      // Tham số truy vấn
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        tableName: undefined,
        tableComment: undefined
      },
      // Xem trước tham số
      preview: {
        open: false,
        title: "Xem trước mã",
        data: {},
        activeName: "domain.java"
      }
    };
  },
  created() {
    this.getList();
  },
  activated() {
    const time = this.$route.query.t;
    if (time != null && time != this.uniqueId) {
      this.uniqueId = time;
      this.queryParams.pageNum = Number(this.$route.query.pageNum);
      this.getList();
    }
  },
  methods: {
    /** Bộ sưu tập bảng truy vấn */
    getList() {
      this.loading = true;
      listTable(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.tableList = response.rows;
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** Hoạt động nút tìm */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** Tạo hoạt động mã */
    handleGenTable(row) {
      const tableNames = row.tableName || this.tableNames;
      if (tableNames == "") {
        this.$modal.msgError("Vui lòng chọn dữ liệu bạn muốn tạo");
        return;
      }
      if(row.genType === "1") {
        genCode(row.tableName).then(response => {
          this.$modal.msgSuccess("Thế hệ thành công đến đường dẫn tùy chỉnh:" + row.genPath);
        });
      } else {
        this.$download.zip("/tool/gen/batchGenCode?tables=" + tableNames, "ruoyi");
      }
    },
    /** Hoạt động cơ sở dữ liệu đồng bộ */
    handleSynchDb(row) {
      const tableName = row.tableName;
      this.$modal.confirm('Xác nhận rằng bạn cần phải đồng bộ hóa bắt buộc"' + tableName + '"Là cấu trúc bảng?').then(function() {
        return synchDb(tableName);
      }).then(() => {
        this.$modal.msgSuccess("Thành công");
      }).catch(() => {});
    },
    /** Mở Nhập Excel */
    openImportTable() {
      this.$refs.import.show();
    },
    /** Làm Hoạt động nút MớI */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** Nút xem trước */
    handlePreview(row) {
      previewTable(row.tableId).then(response => {
        this.preview.data = response.data;
        this.preview.open = true;
        this.preview.activeName = "domain.java";
      });
    },
    /** Điểm nổi bật */
    highlightedCode(code, key) {
      const vmName = key.substring(key.lastIndexOf("/") + 1, key.indexOf(".vm"));
      var language = vmName.substring(vmName.indexOf(".") + 1, vmName.length);
      const result = hljs.highlight(language, code || "", true);
      return result.value || '&nbsp;';
    },
    /** Sao chép mã thành công */
    clipboardSuccess() {
      this.$modal.msgSuccess("Nhân rộng");
    },
    // Dữ liệu lựa chọn hộp đa chương trình
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.tableId);
      this.tableNames = selection.map(item => item.tableName);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** Hoạt động nút Sửa */
    handleEditTable(row) {
      const tableId = row.tableId || this.ids[0];
      const tableName = row.tableName || this.tableNames[0];
      const params = { pageNum: this.queryParams.pageNum };
      this.$tab.openPage("Sửa[" + tableName + "]Tạo cấu hình", '/tool/gen-edit/index/' + tableId, params);
    },
    /** Hoạt động nút Xoá */
    handleDelete(row) {
      const tableIds = row.tableId || this.ids;
      this.$modal.confirm('Có xác nhận số bảng XOá không"' + tableIds + '"Mục dữ liệu?').then(function() {
        return delTable(tableIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    }
  }
};
</script>
