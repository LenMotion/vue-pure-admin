import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection, copyTextToClipboard } from "@pureadmin/utils";
import {
  getDictTypeListApi,
  updateDictTypeStatusApi,
  type DictTypeModel,
  saveOrUpdateDictTypeApi,
  delDictTypeApi
} from "@/api/system/dict";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import { addDrawer } from "@/components/ReDrawer";
import DictDataList from "../components/DictDataList.vue";
import CopyDocument from "~icons/ep/document-copy";

export function useDictType() {
  const form = reactive({
    dictType: "0", // 默认选中业务字典
    dictName: "",
    dictKey: "",
    status: ""
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 90,
      index: (index: number) =>
        (pagination.currentPage - 1) * pagination.pageSize + index + 1
    },
    {
      label: "字典名称",
      prop: "dictName",
      minWidth: 150
    },
    {
      label: "字典Key",
      prop: "dictKey",
      minWidth: 180,
      cellRenderer: ({ row }) => (
        <div
          style="display: flex; align-items: center; gap: 6px; cursor: pointer"
          onClick={() => handleOpenDictDataDrawer(row.dictKey)}
          title="点击查看字典数据"
        >
          <span style="color: var(--el-color-primary)">{row.dictKey}</span>
          <el-button
            link
            size="small"
            type="primary"
            style="padding: 0; margin-left: 4px; min-height: auto;"
            onClick={(e: Event) => {
              e.stopPropagation();
              handleCopyDictKey(row.dictKey);
            }}
            title="复制字典Key"
          >
            <CopyDocument style="width: 14px; height: 14px; color: var(--el-color-success);" />
          </el-button>
        </div>
      )
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
      label: "备注",
      prop: "remark",
      minWidth: 160
    },
    {
      label: "创建时间",
      prop: "createTime",
      minWidth: 160,
      formatter: ({ createTime }) =>
        createTime ? dayjs(createTime).format("YYYY-MM-DD HH:mm:ss") : ""
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  function onChange({ row, index }) {
    const oldStatus = row.status === "0" ? "1" : "0";
    const newStatus = row.status;
    const action = newStatus === "0" ? "启用" : "停用";

    ElMessageBox.confirm(
      `确认要<strong>${action}</strong><strong style='color:var(--el-color-primary)'>${
        row.dictName
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
        await updateDictTypeStatusApi({ id: row.id, status: newStatus });
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          message(`已${action}${row.dictName}`, {
            type: "success"
          });
          onSearch();
        }, 300);
      })
      .catch(() => {
        row.status = oldStatus;
      });
  }

  function handleDelete(row) {
    delDictTypeApi(row.id).then(res => {
      if (res.code === 200) {
        message(`您删除了字典名称为${row.dictName}的这条数据`, {
          type: "success"
        });
        onSearch();
      }
    });
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    pagination.currentPage = 1; // 切换每页大小时重置到第一页
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function handleCopyDictKey(dictKey: string) {
    if (dictKey) {
      const success = copyTextToClipboard(dictKey);
      if (success) {
        message("复制成功", { type: "success" });
      } else {
        message("复制失败", { type: "error" });
      }
    }
  }

  function handleOpenDictDataDrawer(dictKey: string) {
    addDrawer({
      title: `字典数据列表（${dictKey}）`,
      size: "60%",
      headerClass: "dict-drawer-header",
      headerRenderer: ({ titleId, titleClass }) => (
        <div class="flex flex-row justify-between dict-drawer-header">
          <h4 id={titleId} class={titleClass}>
            {`字典数据列表（${dictKey}）`}
          </h4>
        </div>
      ),
      contentRenderer: () => h(DictDataList, { dictKey }),
      hideFooter: true
    });
  }

  async function onSearch() {
    loading.value = true;
    const queryParams = {
      ...toRaw(form),
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    const { result } = await getDictTypeListApi(queryParams);
    dataList.value = result.items;
    pagination.total = result.total;
    pagination.pageSize = result.pageSize;
    pagination.currentPage = result.pageNum;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: DictTypeModel) {
    addDialog({
      title: `${title}字典类型`,
      props: {
        formInline: {
          dictType: row?.dictType ?? "1", // 新增时默认业务字典
          dictName: row?.dictName ?? "",
          dictKey: row?.dictKey ?? "",
          status: row?.status ?? "0",
          remark: row?.remark ?? ""
        }
      },
      width: "40%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as DictTypeModel;
        function chores() {
          message(`您${title}了字典名称为${curData.dictName}的这条数据`, {
            type: "success"
          });
          done();
          onSearch();
        }
        FormRef.validate(valid => {
          if (valid) {
            const apiData = {
              ...curData,
              id: title === "修改" ? row?.id : undefined
            };
            saveOrUpdateDictTypeApi(apiData).then(res => {
              if (res.code === 200) {
                chores();
              }
            });
          }
        });
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
    pagination,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
