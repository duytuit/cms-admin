<template>
  <el-form ref="form" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="Người dùng" prop="nickName">
      <el-input v-model="user.nickName" maxlength="30" />
    </el-form-item> 
    <el-form-item label="SĐT" prop="phonenumber">
      <el-input v-model="user.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="Email" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="giới tính">
      <el-radio-group v-model="user.sex">
        <el-radio label="0">Nam giới</el-radio>
        <el-radio label="1">Nữ giới</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">Lưu</el-button>
      <el-button type="danger" size="mini" @click="close">Hủy</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { updateUserProfile } from "@/api/system/user";

export default {
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      // Hình thức xác minh
      rules: {
        nickName: [
          { required: true, message: "Biệt danh người dùng không thể trống", trigger: "blur" }
        ],
        email: [
          { required: true, message: "Địa chỉ hộp thư không thể trống", trigger: "blur" },
          {
            type: "email",
            message: "Vui lòng nhập đúng địa chỉ email",
            trigger: ["blur", "change"]
          }
        ],
        phonenumber: [
          { required: true, message: "SĐT Không thể trống", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "Vui lòng nhập đúng SĐT",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    submit() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          updateUserProfile(this.user).then(response => {
            this.$modal.msgSuccess("Sửa thành công");
          });
        }
      });
    },
    close() {
      this.$tab.closePage();
    }
  }
};
</script>
