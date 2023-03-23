<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header"><span>CPU</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">Thuộc tính</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">giá trị</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Số cốt lõi</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.cpu">{{ server.cpu.cpuNum }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Tỷ lệ sử dụng người dùng</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.cpu">{{ server.cpu.used }}%</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Tốc độ sử dụng hệ thống</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.cpu">{{ server.cpu.sys }}%</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Tỷ lệ nhàn rỗi hiện tại</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.cpu">{{ server.cpu.free }}%</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header"><span>Kỉ niệm</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell is-leaf"><div class="cell">Thuộc tính</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Kỉ niệm</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Tổng bộ nhớ</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem">{{ server.mem.total }}G</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Kỉ niệm</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem">{{ server.mem.used}}G</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Bộ nhớ còn lại</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem">{{ server.mem.free }}G</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Tỷ lệ sử dụng</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.mem" :class="{'text-danger': server.mem.usage > 80}">{{ server.mem.usage }}%</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>Thông tin máy chủ</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">Biệt danh máy chủ</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.computerName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">hệ điều hành</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.osName }}</div></td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf"><div class="cell">IP máy chủ</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.computerIp }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">cấu trúc hệ thống</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" v-if="server.sys">{{ server.sys.osArch }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>Đĩa Trạng thái</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="el-table__cell el-table__cell is-leaf"><div class="cell">Đường dẫn đĩa</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Hệ thống tập tin</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Loại đĩa</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Tổng kích thước</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Kích thước sẵn có</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Sử dụng kích thước</div></th>
                  <th class="el-table__cell is-leaf"><div class="cell">Phần trăm</div></th>
                </tr>
              </thead>
              <tbody v-if="server.sysFiles">
                <tr v-for="(sysFile, index) in server.sysFiles" :key="index">
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.dirName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.sysTypeName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.typeName }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.total }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.free }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell">{{ sysFile.used }}</div></td>
                  <td class="el-table__cell is-leaf"><div class="cell" :class="{'text-danger': sysFile.usage > 80}">{{ sysFile.usage }}%</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getServer } from "@/api/monitor/server";

export default {
  name: "Server",
  data() {
    return {
      // Thông tin máy chủ
      server: []
    };
  },
  created() {
    this.getList();
    this.openLoading();
  },
  methods: {
    /** Thông tin máy chủ truy vấn */
    getList() {
      getServer().then(response => {
        this.server = response.data;
        this.$modal.closeLoading();
      });
    },
    // Mở lớp tải
    openLoading() {
      this.$modal.loading("Đang tải dữ liệu giám sát dịch vụ, vui lòng đợi!");
    }
  }
};
</script>