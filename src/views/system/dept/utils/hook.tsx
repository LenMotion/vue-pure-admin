import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import {
  getDeptListApi,
  saveOrUpdateDeptApi,
  delDeptApi,
  updateDeptStatusApi,
  type DeptModel
} from "@/api/system/dept";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import { isAllEmpty, deviceDetection } from "@pureadmin/utils";

export function useDept() {
  const form = reactive({
    deptName: "",
    status: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();

  const columns: TableColumnList = [
    {
      label: "部门名称",
      prop: "deptName",
      width: 180,
      align: "left"
    },
    {
      label: "简称",
      prop: "shortName",
      width: 120,
      align: "left"
    },
    {
      label: "部门编码",
      prop: "deptCode",
      width: 180,
      align: "left"
    },
    {
      label: "负责人",
      prop: "leader",
      align: "left"
    },
    {
      label: "排序",
      prop: "orderNum",
      minWidth: 70
    },
    {
      label: "状态",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value="0"
          inactive-value="1"
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 90
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "createTime",
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 320
    },
    {
      label: "操作",
      fixed: "right",
      width: 210,
      slot: "operation"
    }
  ];

  function onChange({ row, index }) {
    // 保存旧状态，因为 switch 点击后 row.status 已经是新值了
    const oldStatus = row.status === "0" ? "1" : "0";
    const newStatus = row.status;
    const action = newStatus === "0" ? "启用" : "停用";

    ElMessageBox.confirm(
      `确认要<strong>${action}</strong><strong style='color:var(--el-color-primary)'>${
        row.deptName
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(async () => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        await updateDeptStatusApi({ id: row.id, status: newStatus });
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          message(`已${action}${row.deptName}`, {
            type: "success"
          });
          onSearch();
        }, 300);
      })
      .catch(() => {
        // 取消操作，恢复原状态
        row.status = oldStatus;
      });
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    console.log(form);
    try {
      const { result } = await getDeptListApi(); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
      let newData = result;
      if (!isAllEmpty(form.deptName)) {
        // 前端搜索部门名称
        newData = newData.filter(item => item.deptName.includes(form.deptName));
      }
      if (!isAllEmpty(form.status)) {
        // 前端搜索状态
        newData = newData.filter(item => item.status === form.status);
      }
      console.log(newData);
      dataList.value = newData; // 处理成树结构
    } finally {
      loading.value = false;
    }
  }

  function openDialog(title = "新增", row?: DeptModel) {
    addDialog({
      title: `${title}部门`,
      props: {
        formInline: { ...row }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as DeptModel;
        function chores() {
          message(`您${title}了部门名称为${curData.deptName}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 将表单数据映射为API需要的格式
            const apiData = {
              ...curData,
              id: title === "修改" ? row?.id : undefined
            };
            console.log("apiData", apiData);
            // 调用保存或更新接口
            saveOrUpdateDeptApi(apiData).then(res => {
              if (res.code === 200) {
                chores();
              }
            });
          }
        });
      }
    });
  }

  function handleDelete(row) {
    delDeptApi(row.id).then(res => {
      if (res.code === 200) {
        message(`您删除了部门名称为${row.deptName}的这条数据`, {
          type: "success"
        });
        onSearch();
      }
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、修改部门 */
    openDialog,
    /** 删除部门 */
    handleDelete,
    handleSelectionChange
  };
}
