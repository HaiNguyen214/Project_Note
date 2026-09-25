import React, { useState, useEffect } from 'react';

function Notes() {
  /* ========================================================================
  VÙNG 1: KHỞI TẠO STATE
  ======================================================================== */
  const [topic, setTopic] = useState('hoc-tap');
  const [notes, setNotes] = useState([]);

  // State tìm kiếm
  const [search, setSearch] = useState('');

  // State form thêm / sửa
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    content: ''
  });

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Số note trên mỗi trang
  const notesPerPage = 6;

  /* ========================================================================
  VÙNG 2: XỬ LÝ LOGIC & GỌI API
  ======================================================================== */

  const fetchNotes = () => {
    fetch(`http://localhost:5000/api/notes/${topic}`)
      .then(res => res.json())
      .then(data => {
        setNotes(data);

        // Sau khi tải lại dữ liệu, về trang 1
        setCurrentPage(1);
      })
      .catch(error => {
        console.error('Lỗi khi lấy notes:', error);
      });
  };

  useEffect(() => {
    fetchNotes();

    // Khi đổi chủ đề:
    // - Xóa tìm kiếm
    // - Về trang 1
    setSearch('');
    setCurrentPage(1);
  }, [topic]);

  /* ========================================================================
  THÊM / SỬA
  ======================================================================== */

  const handleSave = () => {
    // Kiểm tra dữ liệu
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    const method = formData.id ? 'PUT' : 'POST';

    const url = formData.id
      ? `http://localhost:5000/api/notes/${topic}/${formData.id}`
      : `http://localhost:5000/api/notes/${topic}`;

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: formData.title,
        content: formData.content
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Lưu ghi chú thất bại');
        }

        return res.json();
      })
      .then(() => {
        fetchNotes();

        setFormData({
          id: null,
          title: '',
          content: ''
        });
      })
      .catch(error => {
        console.error(error);
        alert('Có lỗi xảy ra khi lưu ghi chú!');
      });
  };

  /* ========================================================================
  XÓA
  ======================================================================== */

  const handleDelete = (id) => {
    if (
      window.confirm(
        'Bạn có chắc muốn xóa ghi chú này?'
      )
    ) {
      fetch(
        `http://localhost:5000/api/notes/${topic}/${id}`,
        {
          method: 'DELETE'
        }
      )
        .then(res => {
          if (!res.ok) {
            throw new Error('Xóa thất bại');
          }

          return res.json();
        })
        .then(() => {
          fetchNotes();
        })
        .catch(error => {
          console.error(error);
          alert('Có lỗi xảy ra khi xóa ghi chú!');
        });
    }
  };

  /* ========================================================================
  SỬA
  ======================================================================== */

  const handleEdit = (note) => {
    setFormData({
      id: note.id,
      title: note.title,
      content: note.content
    });

    // Cuộn lên đầu để sửa
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /* ========================================================================
  HỦY SỬA
  ======================================================================== */

  const handleCancelEdit = () => {
    setFormData({
      id: null,
      title: '',
      content: ''
    });
  };

  /* ========================================================================
  VÙNG 3: TÌM KIẾM
  ======================================================================== */

  const filteredNotes = notes.filter(note => {
    const keyword = search.toLowerCase().trim();

    // Không tìm kiếm -> hiển thị tất cả
    if (!keyword) {
      return true;
    }

    // Tìm trong tiêu đề hoặc nội dung
    return (
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword)
    );
  });

  /* ========================================================================
  VÙNG 4: PHÂN TRANG
  ======================================================================== */

  // Tổng số trang
  const totalPages = Math.ceil(
    filteredNotes.length / notesPerPage
  );

  // Vị trí bắt đầu
  const startIndex =
    (currentPage - 1) * notesPerPage;

  // Lấy note của trang hiện tại
  const currentNotes = filteredNotes.slice(
    startIndex,
    startIndex + notesPerPage
  );

  /* ========================================================================
  XỬ LÝ TÌM KIẾM
  ======================================================================== */

  const handleSearch = (value) => {
    setSearch(value);

    // Mỗi lần tìm kiếm -> về trang 1
    setCurrentPage(1);
  };

  /* ========================================================================
  CHUYỂN TRANG
  ======================================================================== */

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  /* ========================================================================
  VÙNG 5: RENDER GIAO DIỆN
  ======================================================================== */

  return (
    <div style={{ padding: '20px' }}>
      <h2>Ghi chú Công khai</h2>

      {/* ====================================================================
      5.1. CHỌN CHỦ ĐỀ
      ==================================================================== */}

      <div style={{ marginBottom: '20px' }}>
        <strong>Chủ đề: </strong>

        <select
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
        >
          <option value="hoc-tap">
            Học tập
          </option>

          <option value="cong-viec">
            Công việc
          </option>

          <option value="ca-nhan">
            Cá nhân
          </option>
        </select>
      </div>

      {/* ====================================================================
      5.2. TÌM KIẾM
      ==================================================================== */}

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm ghi chú..."
          value={search}
          onChange={(e) =>
            handleSearch(e.target.value)
          }
          style={{
            display: 'block',
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* ====================================================================
      5.3. FORM THÊM / SỬA
      ==================================================================== */}

      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          marginBottom: '20px'
        }}
      >
        <h3>
          {formData.id
            ? ' Sửa ghi chú'
            : '➕ Thêm ghi chú mới'}
        </h3>

        <input
          placeholder="Tiêu đề"
          value={formData.title}
          onChange={(e) =>
            setFormData({
              ...formData,
              title: e.target.value
            })
          }
          style={{
            display: 'block',
            width: '100%',
            marginBottom: '10px',
            padding: '8px',
            boxSizing: 'border-box'
          }}
        />

        <textarea
          placeholder="Nội dung"
          value={formData.content}
          onChange={(e) =>
            setFormData({
              ...formData,
              content: e.target.value
            })
          }
          style={{
            display: 'block',
            width: '100%',
            height: '80px',
            marginBottom: '10px',
            padding: '8px',
            boxSizing: 'border-box'
          }}
        />

        <button onClick={handleSave}>
          {formData.id
            ? ' Cập nhật'
            : ' Thêm mới'}
        </button>

        {formData.id && (
          <button
            onClick={handleCancelEdit}
            style={{
              marginLeft: '10px'
            }}
          >
             Hủy
          </button>
        )}
      </div>

      {/* ====================================================================
      5.4. THÔNG TIN KẾT QUẢ
      ==================================================================== */}

      {search ? (
        <p style={{ marginBottom: '15px' }}>
          Tìm thấy{' '}
          <strong>
            {filteredNotes.length}
          </strong>{' '}
          ghi chú với từ khóa "
          <strong>{search}</strong>"
        </p>
      ) : (
        <p style={{ marginBottom: '15px' }}>
          Tổng cộng:{' '}
          <strong>{notes.length}</strong>{' '}
          ghi chú
        </p>
      )}

      {/* ====================================================================
      5.5. DANH SÁCH NOTE CỦA TRANG HIỆN TẠI
      ==================================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}
      >
        {currentNotes.length === 0 && (
          <p>
            {search
              ? `Không tìm thấy ghi chú nào với từ khóa "${search}".`
              : 'Chưa có ghi chú nào.'}
          </p>
        )}

        {currentNotes.map(note => (
          <div
            key={note.id}
            style={{
              border: '1px solid #007bff',
              padding: '15px',
              borderRadius: '5px'
            }}
          >
            <h4
              style={{
                margin: '0 0 10px 0'
              }}
            >
              {note.title}
            </h4>

            <p
              style={{
                whiteSpace: 'pre-wrap'
              }}
            >
              {note.content}
            </p>

            <div
              style={{
                marginTop: '10px'
              }}
            >
              {/* Sửa */}
              <button
                onClick={() =>
                  handleEdit(note)
                }
                style={{
                  marginRight: '10px'
                }}
              >
                 Sửa
              </button>

              {/* Xóa */}
              <button
                onClick={() =>
                  handleDelete(note.id)
                }
                style={{
                  color: 'red'
                }}
              >
                 Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================================
      5.6. PHÂN TRANG
      ==================================================================== */}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            marginTop: '30px',
            paddingBottom: '20px'
          }}
        >
          {/* Trang trước */}
          <button
            onClick={() =>
              goToPage(currentPage - 1)
            }
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              cursor:
                currentPage === 1
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                currentPage === 1
                  ? 0.5
                  : 1
            }}
          >
            Trước
          </button>

          {/* Số trang */}
          {Array.from(
            {
              length: totalPages
            },
            (_, index) => index + 1
          ).map(page => (
            <button
              key={page}
              onClick={() =>
                goToPage(page)
              }
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',

                backgroundColor:
                  currentPage === page
                    ? '#007bff'
                    : 'white',

                color:
                  currentPage === page
                    ? 'white'
                    : 'black',

                fontWeight:
                  currentPage === page
                    ? 'bold'
                    : 'normal'
              }}
            >
              {page}
            </button>
          ))}

          {/* Trang sau */}
          <button
            onClick={() =>
              goToPage(currentPage + 1)
            }
            disabled={
              currentPage === totalPages
            }
            style={{
              padding: '8px 12px',
              cursor:
                currentPage === totalPages
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                currentPage === totalPages
                  ? 0.5
                  : 1
            }}
          >
            Sau 
          </button>
        </div>
      )}

      {/* Thông tin trang */}
      {totalPages > 0 && (
        <p
          style={{
            textAlign: 'center',
            color: '#666'
          }}
        >
          Trang {currentPage} / {totalPages}
        </p>
      )}
    </div>
  );
}

export default Notes;