<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="Tên menu" prop="menuName">
        <el-input
          v-model="queryParams.menuName"
          placeholder="Vui lòng nhập Tên menu"
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
          v-hasPermi="['system:menu:add']"
        >Thêm</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-sort"
          size="mini"
          @click="toggleExpandAll"
        >Mở rộng/đóng</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="menuName" label="Tên menu" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="biểu tượng" align="center" width="100">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="Loại" width="60"></el-table-column>
      <el-table-column prop="perms" label="Quyền" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="Đường dẫn thành phần" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="status" label="Trạng thái" width="80">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="Thời gian" align="center" prop="createTime">
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
            v-hasPermi="['system:menu:edit']"
          >Sửa</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPermi="['system:menu:add']"
          >Thêm</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:menu:remove']"
          >Xoá</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Thêm hoặc hộp thoại SửA Menu -->
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="Menu vượt trội">
              <treeselect
                v-model="form.parentId"
                :options="menuOptions"
                :normalizer="normalizer"
                :show-count="true"
                placeholder="Chọn một menu vượt trội"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="Thực đơn" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio label="M">Mục lục</el-radio>
                <el-radio label="C">thực đơn</el-radio>
                <el-radio label="F">Cái nút</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.menuType != 'F'">
            <el-form-item label="Biểu tượng menu" prop="icon">
              <el-popover
                placement="bottom-start"
                width="460"
                trigger="click"
                @show="$refs['iconSelect'].reset()"
              >
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" placeholder="Bấm để chọn biểu tượng" readonly>
                  <svg-icon
                    v-if="form.icon"
                    slot="prefix"
                    :icon-class="form.icon"
                    class="el-input__icon"
                    style="height: 32px;width: 16px;"
                  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon" />
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên menu" prop="menuName">
              <el-input v-model="form.menuName" placeholder="Vui lòng nhập Tên menu" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Hiển thị phân loại" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <span slot="label">
                <el-tooltip content="Chọn là địa chỉ định tuyến của liên kết bên ngoài, bạn cần sử dụng nó `http(s)://`bắt đầu" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                Liệu liên kết bên ngoài có
              </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio label="0">Vâng</el-radio>
                <el-radio label="1">không</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item prop="path">
              <span slot="label">
                <el-tooltip content="Địa chỉ định tuyến của truy cập, chẳng hạn như ::`user`，Nếu địa chỉ mạng bên ngoài cần được truy cập trong chuỗi bên trong`http(s)://`bắt đầu" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                Địa chỉ định tuyến
              </span>
              <el-input v-model="form.path" placeholder="Vui lòng nhập địa chỉ định tuyến" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item prop="component">
              <span slot="label">
                <el-tooltip content="Truy cập các đường dẫn thành phần, chẳng hạn như:`system/user/index`, Theo mặc định`views`Dưới nội dung" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                Đường dẫn thành phần
              </span>
              <el-input v-model="form.component" placeholder="Vui lòng nhập đường dẫn thành phần" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'M'">
            <el-form-item>
              <el-input v-model="form.perms" placeholder="Vui lòng nhập logo quyền" maxlength="100" />
              <span slot="label">
                <el-tooltip content="Ký tự quyền được xác định trong bộ điều khiển, chẳng hạn như:@PreAuthorize(`@ss.hasPermi('system:user:list')`)" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                Nhân vật cho phép
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item>
              <el-input v-model="form.query" placeholder="Vui lòng nhập tham số định tuyến" maxlength="255" />
              <span slot="label">
                <el-tooltip content='Truy cập các tham số truyền mặc định của tuyến đường, chẳng hạn như：`{"id": 1, "name": "ry"}`' placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                Tham số định tuyến
              </span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == 'C'">
            <el-form-item>
              <span slot="label">
                <el-tooltip content="Chọn là để được chăn`keep-alive`Bộ nhớ cache, bạn cần phù hợp với thành phần`name`Giữ địa chỉ nhất quán" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                Có phải bộ nhớ cache
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio label="0">Bộ nhớ cache</el-radio>
                <el-radio label="1">Không phải bộ nhớ cache</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <span slot="label">
                <el-tooltip content="Chọn ẩn, tuyến đường sẽ không xuất hiện trong thanh bên, nhưng bạn vẫn có thể truy cập" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                 Trạng thái
              </span>
              <el-radio-group v-model="form.visible">
                <el-radio
                  v-for="dict in dict.type.sys_show_hide"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != 'F'">
            <el-form-item>
              <span slot="label">
                <el-tooltip content="Khi chọn dừng lại, tuyến đường sẽ không xuất hiện trên thanh bên, cũng không thể truy cập" placement="top">
                <i class="el-icon-question"></i>
                </el-tooltip>
                 Trạng thái
              </span>
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in dict.type.sys_normal_disable"
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
  </div>
</template>

<script>
import { listMenu, getMenu, delMenu, addMenu, updateMenu } from "@/api/system/menu";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";

export default {
  name: "Menu",
  dicts: ['sys_show_hide', 'sys_normal_disable'],
  components: { Treeselect, IconSelect },
  data() {
    return {
      // Lớp mặt nạ
      loading: true,
      // Tìm kiếm điều kiện, tình trạng, trạng thái
      showSearch: true,
      // Dữ liệu cây menu
      menuList: [],
      // Tùy chọn cây menu
      menuOptions: [],
      // Tiêu đề lớp pop -up
      title: "",
      // Có hiển thị lớp pop -up
      open: false,
      // Có mở không, tất cả được gấp lại theo mặc định
      isExpandAll: false,
      // Bảng tái tạo Trạng thái
      refreshTable: true,
      // Tham số truy vấn
      queryParams: {
        menuName: undefined,
        visible: undefined
      },
      // Biểu mẫu tham số
      form: {},
      // Hình thức xác minh
      rules: {
        menuName: [
          { required: true, message: "Tên menu Không thể trống", trigger: "blur" }
        ],
        orderNum: [
          { required: true, message: "Thứ tự menu không thể trống", trigger: "blur" }
        ],
        path: [
          { required: true, message: "Địa chỉ tuyến đường không thể trống", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    // Chọn Biểu tượng
    selected(name) {
      this.form.icon = name;
    },
    /** Danh sách menu truy vấn */
    getList() {
      this.loading = true;
      listMenu(this.queryParams).then(response => {
        this.menuList = this.handleTree(response.data, "menuId");
        this.loading = false;
      });
    },
    /** Cấu trúc dữ liệu menu chuyển đổi */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.menuId,
        label: node.menuName,
        children: node.children
      };
    },
    /** Menu truy vấn kéo xuống cấu trúc cây */
    getTreeselect() {
      listMenu().then(response => {
        this.menuOptions = [];
        const menu = { menuId: 0, menuName: 'Trụ cột', children: [] };
        menu.children = this.handleTree(response.data, "menuId");
        this.menuOptions.push(menu);
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
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: undefined,
        path:undefined,
        component:undefined,
        isFrame: "1",
        isCache: "0",
        visible: "0",
        status: "0"
      };
      this.resetForm("form");
    },
    /** Tìm Hoạt động nút */
    handleQuery() {
      this.getList();
    },
    /** Làm mới Hoạt động nút */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** Thêm Hoạt động nút */
    handleAdd(row) {
      this.reset();
      this.getTreeselect();
      if (row != null && row.menuId) {
        this.form.parentId = row.menuId;
      } else {
        this.form.parentId = 0;
      }
      this.open = true;
      this.title = "Thêm menu";
    },
    /** Mở rộng/đóng chạy */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },
    /** Hoạt động nút Sửa */
    handleUpdate(row) {
      this.reset();
      this.getTreeselect();
      getMenu(row.menuId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "Menu sửa";
      });
    },
    /** Gửi nút */
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.menuId != undefined) {
            updateMenu(this.form).then(response => {
              this.$modal.msgSuccess("Sửa thành công");
              this.open = false;
              this.getList();
            });
          } else {
            addMenu(this.form).then(response => {
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
      this.$modal.confirm('Có xác nhận tên của Xoá là"' + row.menuName + '"Mục dữ liệu?').then(function() {
        return delMenu(row.menuId);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("Xoá thành công");
      }).catch(() => {});
    }
  }
};
</script>
